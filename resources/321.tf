resource "aws_s3_bucket" "example" {
provider = aws.bucket_region
name = "321"
acl = "private"
}
