import React from "react";

export default function DocsAWSDeployment() {
  return (
    <div className="space-y-8 text-[--foreground]/80 font-[sans-serif]">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-[--foreground] mb-4">
          AWS & Serverless Deployment
        </h1>
        <p className="text-lg leading-relaxed text-[--foreground]/90">
          Understanding the `aws-serverless/backend` structure and how Tackleit is deployed globally using AWS Lambda.
        </p>
      </div>

      <div className="bg-[--primary]/5 border border-[--primary]/20 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-[--primary] mb-2 flex items-center gap-2">
          🌍 Why Two Backend Folders?
        </h2>
        <p className="leading-relaxed text-sm">
          You might have noticed two backend directories: `backend` and `aws-serverless/backend`. Both share the exact same core FastAPI logic. The difference is purely in the <strong>deployment adapter</strong>. 
          The regular `backend` is designed for standard `uvicorn` local execution or containerized Docker (EC2/ECS) deployments. 
          The `aws-serverless/backend` is wrapped with a Serverless adapter designed to plug directly into AWS Lambda and API Gateway.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[--foreground] border-b border-[--border] pb-2 mb-4">
          Using Magnum for AWS Lambda
        </h2>
        <p className="leading-relaxed">
          To run standard Python ASGI frameworks (like FastAPI) on AWS Lambda without rewriting the routing logic, we use <code className="bg-[--foreground]/10 px-1 py-0.5 rounded">Magnum</code>.
        </p>
        <p className="leading-relaxed">
          Magnum acts as an adapter, translating AWS API Gateway events into ASGI scopes that FastAPI understands, and then translating FastAPI's response back into an API Gateway format.
        </p>

        <div className="bg-[--foreground]/5 border border-[--border] rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-[--foreground]/90">
            <code>
{`# Example pattern in aws-serverless/backend/main.py
from fastapi import FastAPI
from magnum import Magnum

app = FastAPI()

# Standard FastAPI routes
@app.get("/")
def read_root():
    return {"message": "Hello World"}

# The Lambda Handler provided by Magnum
handler = Magnum(app)`}
            </code>
          </pre>
        </div>
      </div>

      <div className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-[--foreground] border-b border-[--border] pb-2 mb-4">
          Deployment Checklist
        </h2>
        
        <ul className="list-disc pl-6 space-y-3">
          <li><strong>Keep Folders Synced:</strong> Whenever you make a change to the core API logic in `backend`, ensure those changes are mirrored to `aws-serverless/backend`.</li>
          <li><strong>Lambda Packaging:</strong> When deploying to Lambda, you must package all dependencies. Using the AWS SAM CLI or Serverless Framework is highly recommended to automate the ZIP or Docker container building.</li>
          <li><strong>Environment Variables:</strong> AWS Lambda requires environment variables (MongoDB URIs, JWT Secrets) to be set directly via the AWS Console or Infrastructure as Code (Terraform/CloudFormation) rather than relying on a local `.env` file.</li>
          <li><strong>Cold Starts:</strong> Be mindful of Lambda "Cold Starts". High latency on the first request is normal. If you need consistent low latency, consider using AWS Lambda Provisioned Concurrency.</li>
        </ul>
      </div>

    </div>
  );
}
