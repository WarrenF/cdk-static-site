# AWS CDK Static Site Example

This project uses AWS CDK to deploy a static site to an s3 bucket and setup a cloudfront distribution for it. It will configure a HTTPS certificate in ACM and force HTTPS protocol for visitors.

In order to deploy this project to your own AWS account, the domain you use must be configured as a hosted zone in Route53.

You must also have AWS CDK installed on your machine.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
