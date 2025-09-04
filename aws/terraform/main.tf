# Terraform configuration for AWS API Gateway deployment
# Simple JWT Generator API with OpenAPI specification

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Variables
variable "api_name" {
  description = "Name of the API Gateway"
  type        = string
  default     = "simple-jwt-generator-api"
}

variable "stage_name" {
  description = "API Gateway stage name"
  type        = string
  default     = "prod"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.stage_name)
    error_message = "Stage name must be one of: dev, staging, prod."
  }
}

variable "backend_url" {
  description = "Backend URL for HTTP proxy integration"
  type        = string
}

variable "domain_name" {
  description = "Custom domain name for the API (optional)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM Certificate ARN for custom domain (optional)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "SimpleJwtGenerator"
    Environment = "prod"
    ManagedBy   = "Terraform"
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Local variables
locals {
  has_custom_domain = var.domain_name != ""
  api_gateway_arn   = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.jwt_generator_api.id}"
}

# Read the OpenAPI specification
data "local_file" "openapi_spec" {
  filename = "${path.module}/../openapi.yaml"
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "jwt_generator_api" {
  name        = var.api_name
  description = "Simple JWT Generator API with OpenAPI specification"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  body = templatefile("${path.module}/../openapi.yaml", {
    backend_url = var.backend_url
    aws_region  = data.aws_region.current.name
    account_id  = data.aws_caller_identity.current.account_id
  })

  tags = merge(var.tags, {
    Name = var.api_name
  })
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "jwt_generator_deployment" {
  rest_api_id = aws_api_gateway_rest_api.jwt_generator_api.id

  triggers = {
    redeployment = sha1(jsonencode([
      data.local_file.openapi_spec.content,
      var.backend_url,
      var.stage_name
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [aws_api_gateway_rest_api.jwt_generator_api]
}

# API Gateway Stage
resource "aws_api_gateway_stage" "jwt_generator_stage" {
  deployment_id = aws_api_gateway_deployment.jwt_generator_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.jwt_generator_api.id
  stage_name    = var.stage_name
  description   = "${var.stage_name} stage for JWT Generator API"

  variables = {
    backend_url = var.backend_url
  }

  xray_tracing_enabled = true

  tags = merge(var.tags, {
    Name = "${var.api_name}-${var.stage_name}"
  })
}

# Method Settings for caching and throttling
resource "aws_api_gateway_method_settings" "jwt_generator_settings" {
  rest_api_id = aws_api_gateway_rest_api.jwt_generator_api.id
  stage_name  = aws_api_gateway_stage.jwt_generator_stage.stage_name
  method_path = "*/*"

  settings {
    # Logging
    logging_level      = "INFO"
    data_trace_enabled = false
    metrics_enabled    = true

    # Throttling
    throttling_burst_limit = 1000
    throttling_rate_limit  = 500
  }
}

# Specific caching for JWKS endpoints
resource "aws_api_gateway_method_settings" "jwks_caching" {
  rest_api_id = aws_api_gateway_rest_api.jwt_generator_api.id
  stage_name  = aws_api_gateway_stage.jwt_generator_stage.stage_name
  method_path = "api/jwks/GET"

  settings {
    caching_enabled        = true
    cache_ttl_in_seconds   = 86400  # 24 hours
    cache_key_parameters   = []
    require_authorization_for_cache_control = false
  }
}

resource "aws_api_gateway_method_settings" "well_known_jwks_caching" {
  rest_api_id = aws_api_gateway_rest_api.jwt_generator_api.id
  stage_name  = aws_api_gateway_stage.jwt_generator_stage.stage_name
  method_path = "api/.well-known/jwks.json/GET"

  settings {
    caching_enabled        = true
    cache_ttl_in_seconds   = 86400  # 24 hours
    cache_key_parameters   = []
    require_authorization_for_cache_control = false
  }
}

# Usage Plan
resource "aws_api_gateway_usage_plan" "jwt_generator_usage_plan" {
  name        = "${var.api_name}-usage-plan"
  description = "Usage plan for JWT Generator API"

  api_stages {
    api_id = aws_api_gateway_rest_api.jwt_generator_api.id
    stage  = aws_api_gateway_stage.jwt_generator_stage.stage_name
  }

  throttle_settings {
    burst_limit = 1000
    rate_limit  = 500
  }

  quota_settings {
    limit  = 100000
    period = "DAY"
  }

  tags = var.tags
}

# API Key
resource "aws_api_gateway_api_key" "jwt_generator_key" {
  name        = "${var.api_name}-key"
  description = "API Key for JWT Generator API"
  enabled     = true

  tags = var.tags
}

# Usage Plan Key
resource "aws_api_gateway_usage_plan_key" "jwt_generator_usage_plan_key" {
  key_id        = aws_api_gateway_api_key.jwt_generator_key.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.jwt_generator_usage_plan.id
}

# Custom Domain (conditional)
resource "aws_api_gateway_domain_name" "custom_domain" {
  count       = local.has_custom_domain ? 1 : 0
  domain_name = var.domain_name

  certificate_arn = var.certificate_arn

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  security_policy = "TLS_1_2"

  tags = merge(var.tags, {
    Name = var.domain_name
  })
}

# Base Path Mapping (conditional)
resource "aws_api_gateway_base_path_mapping" "custom_domain_mapping" {
  count       = local.has_custom_domain ? 1 : 0
  api_id      = aws_api_gateway_rest_api.jwt_generator_api.id
  stage_name  = aws_api_gateway_stage.jwt_generator_stage.stage_name
  domain_name = aws_api_gateway_domain_name.custom_domain[0].domain_name
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name              = "/aws/apigateway/${var.api_name}"
  retention_in_days = 14

  tags = var.tags
}

# IAM Role for API Gateway Logging
resource "aws_iam_role" "api_gateway_logging_role" {
  name = "${var.api_name}-logging-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "api_gateway_logging_policy" {
  role       = aws_iam_role.api_gateway_logging_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

# API Gateway Account (for logging)
resource "aws_api_gateway_account" "api_gateway_account" {
  cloudwatch_role_arn = aws_iam_role.api_gateway_logging_role.arn
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "api_gateway_4xx_errors" {
  alarm_name          = "${var.api_name}-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors 4xx errors for the JWT Generator API"
  alarm_actions       = [] # Add SNS topic ARN here for notifications

  dimensions = {
    ApiName   = aws_api_gateway_rest_api.jwt_generator_api.name
    Stage     = aws_api_gateway_stage.jwt_generator_stage.stage_name
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "api_gateway_5xx_errors" {
  alarm_name          = "${var.api_name}-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors 5xx errors for the JWT Generator API"
  alarm_actions       = [] # Add SNS topic ARN here for notifications

  dimensions = {
    ApiName   = aws_api_gateway_rest_api.jwt_generator_api.name
    Stage     = aws_api_gateway_stage.jwt_generator_stage.stage_name
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "api_gateway_latency" {
  alarm_name          = "${var.api_name}-high-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Latency"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Average"
  threshold           = "5000"  # 5 seconds
  alarm_description   = "This metric monitors high latency for the JWT Generator API"
  alarm_actions       = [] # Add SNS topic ARN here for notifications

  dimensions = {
    ApiName   = aws_api_gateway_rest_api.jwt_generator_api.name
    Stage     = aws_api_gateway_stage.jwt_generator_stage.stage_name
  }

  tags = var.tags
}
