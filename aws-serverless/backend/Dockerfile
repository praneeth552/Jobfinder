# Use the official AWS Lambda Python base image for Python 3.11
FROM public.ecr.aws/lambda/python:3.11

# Set the working directory
WORKDIR /var/task

# 1) Upgrade pip tooling
RUN pip install --upgrade pip setuptools wheel

# 2) Copy constraints + requirements first
COPY constraints.txt .
COPY requirements.txt .

# 3) Preinstall heavy natives as wheels (optional now, but keeps things fast)
RUN pip install --no-cache-dir --only-binary=:all: --target "/var/task" \
    "numpy==2.1.3"

# 4) Install the rest, forcing wheels and respecting constraints
RUN pip install --no-cache-dir \
    --upgrade-strategy only-if-needed \
    -r requirements.txt -c constraints.txt \
    --target "${LAMBDA_TASK_ROOT}"

# 5) spaCy model as a wheel (matches spaCy 3.7.x)
RUN python -m pip install --no-cache-dir \
  https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.1/en_core_web_sm-3.7.1-py3-none-any.whl

# 6) Copy code last
COPY . .

# 7) Handler
CMD ["main.handler"]