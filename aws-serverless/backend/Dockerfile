# Use the official AWS Lambda Python base image
FROM public.ecr.aws/lambda/python:3.9

# Copy function code and other files
COPY . ${LAMBDA_TASK_ROOT}

# Copy the requirements file
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install build tools like gcc
RUN yum install -y gcc

# Install the specified packages from requirements.txt
RUN pip install -r requirements.txt

# Download the spaCy model during the build process
RUN python -m spacy download en_core_web_sm

# Set the CMD to your handler. 
# The format is "<filename>.<handler_function_name>"
CMD [ "main.handler" ]