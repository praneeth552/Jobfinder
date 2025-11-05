# Use the official AWS Lambda Python base image for Python 3.11
FROM public.ecr.aws/lambda/python:3.11

# Set the working directory
WORKDIR /var/task

# 1) Upgrade pip tooling
RUN pip install --upgrade pip setuptools wheel

# 2) Copy constraints + requirements first
COPY constraints.txt .
COPY requirements.txt .

# 3) Install all requirements with constraints
RUN pip install --no-cache-dir \
    --only-binary=:all: \
    --upgrade-strategy only-if-needed \
    -c constraints.txt \
    -r requirements.txt \
    --target "${LAMBDA_TASK_ROOT}"

# 4) spaCy model - install to same target with constraints
RUN pip install --no-cache-dir \
    --only-binary=:all: \
    -c constraints.txt \
    --target "${LAMBDA_TASK_ROOT}" \
    https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.1/en_core_web_sm-3.7.1-py3-none-any.whl

# 5) Copy code last
COPY . .

# 6) Handler
CMD ["main.handler"]