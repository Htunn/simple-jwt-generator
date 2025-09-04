# Terraform Outputs

output "api_id" {
  description = "API Gateway ID"
  value       = aws_api_gateway_rest_api.jwt_generator_api.id
}

output "api_url" {
  description = "API Gateway URL"
  value       = "https://${aws_api_gateway_rest_api.jwt_generator_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${aws_api_gateway_stage.jwt_generator_stage.stage_name}"
}

output "custom_domain_url" {
  description = "Custom domain URL"
  value       = local.has_custom_domain ? "https://${var.domain_name}" : null
}

output "api_key_id" {
  description = "API Key ID"
  value       = aws_api_gateway_api_key.jwt_generator_key.id
}

output "api_key_value" {
  description = "API Key Value"
  value       = aws_api_gateway_api_key.jwt_generator_key.value
  sensitive   = true
}

output "usage_plan_id" {
  description = "Usage Plan ID"
  value       = aws_api_gateway_usage_plan.jwt_generator_usage_plan.id
}

output "openapi_spec_url" {
  description = "OpenAPI Specification URL"
  value       = "https://${aws_api_gateway_rest_api.jwt_generator_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${aws_api_gateway_stage.jwt_generator_stage.stage_name}/api/docs/openapi.json"
}

output "swagger_ui_url" {
  description = "Swagger UI Documentation URL"
  value       = "https://${aws_api_gateway_rest_api.jwt_generator_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${aws_api_gateway_stage.jwt_generator_stage.stage_name}/api/docs/docs"
}

output "jwks_url" {
  description = "JWKS Endpoint URL"
  value       = "https://${aws_api_gateway_rest_api.jwt_generator_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${aws_api_gateway_stage.jwt_generator_stage.stage_name}/api/jwks"
}

output "health_check_url" {
  description = "Health Check URL"
  value       = "https://${aws_api_gateway_rest_api.jwt_generator_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${aws_api_gateway_stage.jwt_generator_stage.stage_name}/health"
}

output "deployment_summary" {
  description = "Deployment summary information"
  value = {
    api_name      = var.api_name
    stage_name    = var.stage_name
    backend_url   = var.backend_url
    region        = data.aws_region.current.name
    account_id    = data.aws_caller_identity.current.account_id
    custom_domain = local.has_custom_domain ? var.domain_name : "Not configured"
  }
}
