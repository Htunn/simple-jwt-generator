#!/bin/bash

# AWS API Gateway Deployment Script for Simple JWT Generator
# This script deploys the JWT Generator API using the OpenAPI specification

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="simple-jwt-generator-api"
TEMPLATE_FILE="aws/api-gateway-template.yaml"
OPENAPI_FILE="openapi.yaml"
REGION="${AWS_REGION:-us-east-1}"
STAGE_NAME="${STAGE_NAME:-prod}"
BACKEND_URL="${BACKEND_URL}"
API_NAME="${API_NAME:-simple-jwt-generator-api}"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if AWS credentials are configured
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Check if required files exist
    if [[ ! -f "$TEMPLATE_FILE" ]]; then
        log_error "CloudFormation template not found: $TEMPLATE_FILE"
        exit 1
    fi
    
    if [[ ! -f "$OPENAPI_FILE" ]]; then
        log_error "OpenAPI specification not found: $OPENAPI_FILE"
        exit 1
    fi
    
    # Check if backend URL is provided
    if [[ -z "$BACKEND_URL" ]]; then
        log_error "BACKEND_URL environment variable is required"
        log_info "Example: export BACKEND_URL=http://your-backend-alb.amazonaws.com"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

validate_openapi() {
    log_info "Validating OpenAPI specification..."
    
    # Check if the OpenAPI file is valid YAML
    if ! python3 -c "import yaml; yaml.safe_load(open('$OPENAPI_FILE'))" 2>/dev/null; then
        log_error "Invalid YAML in OpenAPI specification"
        exit 1
    fi
    
    log_success "OpenAPI specification is valid"
}

deploy_stack() {
    log_info "Deploying CloudFormation stack: $STACK_NAME"
    
    # Parameters for the stack
    PARAMETERS=(
        "ParameterKey=ApiName,ParameterValue=$API_NAME"
        "ParameterKey=StageName,ParameterValue=$STAGE_NAME"
        "ParameterKey=BackendUrl,ParameterValue=$BACKEND_URL"
    )
    
    # Add custom domain parameters if provided
    if [[ -n "$DOMAIN_NAME" ]]; then
        PARAMETERS+=("ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME")
    fi
    
    if [[ -n "$CERTIFICATE_ARN" ]]; then
        PARAMETERS+=("ParameterKey=CertificateArn,ParameterValue=$CERTIFICATE_ARN")
    fi
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" &> /dev/null; then
        log_info "Stack exists, updating..."
        OPERATION="update-stack"
    else
        log_info "Stack does not exist, creating..."
        OPERATION="create-stack"
    fi
    
    # Deploy the stack
    aws cloudformation $OPERATION \
        --stack-name "$STACK_NAME" \
        --template-body "file://$TEMPLATE_FILE" \
        --parameters "${PARAMETERS[@]}" \
        --capabilities CAPABILITY_IAM \
        --region "$REGION" \
        --tags \
            Key=Project,Value=SimpleJwtGenerator \
            Key=Environment,Value="$STAGE_NAME" \
            Key=ManagedBy,Value=CloudFormation
    
    log_info "Waiting for stack operation to complete..."
    
    if [[ "$OPERATION" == "create-stack" ]]; then
        aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME" --region "$REGION"
    else
        aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME" --region "$REGION"
    fi
    
    log_success "Stack deployment completed successfully"
}

get_stack_outputs() {
    log_info "Retrieving stack outputs..."
    
    OUTPUTS=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs' \
        --output json)
    
    API_URL=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="ApiUrl") | .OutputValue')
    API_KEY_ID=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="ApiKeyId") | .OutputValue')
    OPENAPI_SPEC_URL=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="OpenApiSpecUrl") | .OutputValue')
    SWAGGER_UI_URL=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="SwaggerUIUrl") | .OutputValue')
    
    log_success "Deployment completed successfully!"
    echo
    echo "======================================"
    echo "  Simple JWT Generator API Gateway"
    echo "======================================"
    echo
    echo "API Gateway URL: $API_URL"
    echo "API Key ID: $API_KEY_ID"
    echo
    echo "Documentation:"
    echo "  OpenAPI Spec: $OPENAPI_SPEC_URL"
    echo "  Swagger UI: $SWAGGER_UI_URL"
    echo
    echo "Test endpoints:"
    echo "  Health Check: curl $API_URL/health"
    echo "  Generate Token: curl -X POST $API_URL/api/token/generate -H 'Content-Type: application/json' -d '{\"username\":\"demo\",\"email\":\"demo@example.com\"}'"
    echo "  Get JWKS: curl $API_URL/api/jwks"
    echo
    echo "Next steps:"
    echo "1. Test the API endpoints above"
    echo "2. Configure your applications to use the API Gateway URL"
    echo "3. Set up monitoring and alerting"
    echo "4. Configure custom domain if needed"
    echo
}

test_deployment() {
    log_info "Testing API deployment..."
    
    # Test health endpoint
    if curl -f -s "$API_URL/health" > /dev/null; then
        log_success "Health check endpoint is working"
    else
        log_warning "Health check endpoint may not be working"
    fi
    
    # Test JWKS endpoint
    if curl -f -s "$API_URL/api/jwks" > /dev/null; then
        log_success "JWKS endpoint is working"
    else
        log_warning "JWKS endpoint may not be working"
    fi
    
    # Test OpenAPI spec endpoint
    if curl -f -s "$OPENAPI_SPEC_URL" > /dev/null; then
        log_success "OpenAPI specification endpoint is working"
    else
        log_warning "OpenAPI specification endpoint may not be working"
    fi
}

cleanup() {
    log_info "Cleaning up temporary files..."
    # Add cleanup logic here if needed
}

# Main execution
main() {
    log_info "Starting AWS API Gateway deployment for Simple JWT Generator"
    log_info "Stack Name: $STACK_NAME"
    log_info "Region: $REGION"
    log_info "Stage: $STAGE_NAME"
    log_info "Backend URL: $BACKEND_URL"
    echo
    
    check_prerequisites
    validate_openapi
    deploy_stack
    get_stack_outputs
    test_deployment
    cleanup
    
    log_success "Deployment process completed!"
}

# Help function
show_help() {
    echo "AWS API Gateway Deployment Script for Simple JWT Generator"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Environment Variables:"
    echo "  BACKEND_URL       Backend URL for the JWT Generator service (required)"
    echo "  AWS_REGION        AWS region (default: us-east-1)"
    echo "  STAGE_NAME        API Gateway stage name (default: prod)"
    echo "  API_NAME          API Gateway name (default: simple-jwt-generator-api)"
    echo "  DOMAIN_NAME       Custom domain name (optional)"
    echo "  CERTIFICATE_ARN   ACM certificate ARN for custom domain (optional)"
    echo
    echo "Examples:"
    echo "  # Basic deployment"
    echo "  export BACKEND_URL=http://your-backend-alb.amazonaws.com"
    echo "  $0"
    echo
    echo "  # Deployment with custom domain"
    echo "  export BACKEND_URL=http://your-backend-alb.amazonaws.com"
    echo "  export DOMAIN_NAME=api.yourdomain.com"
    echo "  export CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789:certificate/abc123"
    echo "  $0"
    echo
    echo "  # Staging deployment"
    echo "  export BACKEND_URL=http://staging-backend-alb.amazonaws.com"
    echo "  export STAGE_NAME=staging"
    echo "  $0"
    echo
}

# Handle command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
