resource "aws_s3_bucket" "example" {
provider = aws.bucket_region
name = "{{ bucket_name }}"
acl = "{{ bucket_acl }}"
}
