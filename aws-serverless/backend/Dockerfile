# AWS Lambda Python 3.11
FROM public.ecr.aws/lambda/python:3.11

ENV PIP_NO_CACHE_DIR=1
WORKDIR ${LAMBDA_TASK_ROOT}

# 1) Install build tools for Python packaging (not OS compilers)
RUN pip install --upgrade pip setuptools wheel

# 2) Copy requirements first for better caching
COPY requirements.txt .

# 3) Preinstall native-heavy libs from wheels only (adjust/pin as needed)
# If your app uses these, keep them. If not, remove the ones you don't need.
RUN pip install --no-cache-dir --only-binary=:all: --target "${LAMBDA_TASK_ROOT}" \
    "numpy==2.1.3"

# 4) Install the rest of your deps into the task root
RUN pip install --no-cache-dir -r requirements.txt --target "${LAMBDA_TASK_ROOT}"

# 5) spaCy model (use wheel for reproducibility; matches spaCy 3.7.x)
RUN python -m pip install --no-cache-dir \
  https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.1/en_core_web_sm-3.7.1-py3-none-any.whl

# 6) Copy your application code last
COPY . .

# 7) Lambda handler: <module>.<function>
CMD ["main.handler"]
