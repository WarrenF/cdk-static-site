#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { StaticSite } from './static-site'
class MyStaticSiteStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
    super(parent, name, props)
    if (!props?.env?.account || !props?.env?.region) throw new Error('No region or account id set')
    
    new StaticSite(this, 'StaticSite', {
      domainName: 'example-domain.com',
      siteSubDomain: 'static-site',
      websitePath: './website',
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
    })
  }
}

const app = new cdk.App()

new MyStaticSiteStack(app, 'MyStaticSite', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  }
})

app.synth()