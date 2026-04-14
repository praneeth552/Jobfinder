import React from "react";

export default function DocsLocalSetup() {
  return (
    <div className="space-y-8 text-[--foreground]/80 font-[sans-serif]">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-[--foreground] mb-4">
          Getting Started: Local Setup
        </h1>
        <p className="text-lg leading-relaxed text-[--foreground]/90">
          Follow these step-by-step instructions to set up and run the Tackleit project on your local machine.
        </p>
      </div>

      <div className="bg-[--card-background]/80 rounded-xl p-6 border border-[--border]">
        <h2 className="text-xl font-bold text-[--foreground] mb-4">Prerequisites</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Node.js:</strong> v20.x or later</li>
          <li><strong>Python:</strong> v3.9 or later</li>
          <li><strong>MongoDB Atlas:</strong> A free cluster is sufficient.</li>
          <li><strong>Git</strong></li>
        </ul>
      </div>

      <div className="space-y-12">
        {/* Step 1 */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 rounded-full bg-[--primary] text-white flex items-center justify-center font-bold">1</div>
            <h2 className="text-2xl font-bold text-[--foreground]">Clone the Repository</h2>
          </div>
          <div className="bg-[--foreground]/5 p-4 rounded-lg border border-[--border] overflow-x-auto">
            <pre className="text-sm font-mono text-[--foreground]/90">
              <code>
{`git clone https://github.com/praneeth552/Jobfinder.git
cd Jobfinder`}
              </code>
            </pre>
          </div>
        </section>

        {/* Step 2 */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 rounded-full bg-[--primary] text-white flex items-center justify-center font-bold">2</div>
            <h2 className="text-2xl font-bold text-[--foreground]">Backend Setup</h2>
          </div>
          <p className="mb-4 text-[--foreground]/90">Initialize the FastAPI backend and configure your Python virtual environment.</p>
          <div className="bg-[--foreground]/5 p-4 rounded-lg border border-[--border] overflow-x-auto mb-4">
            <pre className="text-sm font-mono text-[--foreground]/90">
              <code>
{`# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate it (On Windows use: venv\\Scripts\\activate)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create and configure the environment file
cp .env.example .env`}
              </code>
            </pre>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 rounded-lg flex items-start gap-3">
            <span className="text-yellow-500 text-xl mt-0.5">⚠️</span>
            <p className="text-sm text-[--foreground]/80 font-medium">Don't forget to configure your <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">.env</code> file with the required API keys (e.g., MongoDB URI, Secret Keys, Razorpay credentials).</p>
          </div>
        </section>

        {/* Step 3 */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 rounded-full bg-[--primary] text-white flex items-center justify-center font-bold">3</div>
            <h2 className="text-2xl font-bold text-[--foreground]">Frontend Setup</h2>
          </div>
          <p className="mb-4 text-[--foreground]/90">Install dependencies for the Next.js application.</p>
          <div className="bg-[--foreground]/5 p-4 rounded-lg border border-[--border] overflow-x-auto mb-4">
            <pre className="text-sm font-mono text-[--foreground]/90">
              <code>
{`# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install

# Create and configure the environment file
cp .env.local.example .env.local`}
              </code>
            </pre>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-3 rounded-lg flex items-start gap-3">
            <span className="text-blue-500 text-xl mt-0.5">ℹ️</span>
            <p className="text-sm text-[--foreground]/80 font-medium">Be sure to configure your <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">.env.local</code> file with paths pointing to your local backend API (typically <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">http://localhost:8000</code>).</p>
          </div>
        </section>

        {/* Step 4 */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 rounded-full bg-[--primary] text-white flex items-center justify-center font-bold">4</div>
            <h2 className="text-2xl font-bold text-[--foreground]">Running the Application</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[--foreground] mb-2 border-l-2 border-[--primary] pl-3">Start the Backend Server</h3>
              <div className="bg-[--foreground]/5 p-4 rounded-lg border border-[--border] overflow-x-auto">
                <pre className="text-sm font-mono text-[--foreground]/90">
                  <code>
{`cd backend
uvicorn main:app --reload
# The backend will run on http://localhost:8000`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[--foreground] mb-2 border-l-2 border-[--primary] pl-3">Start the Frontend Server</h3>
              <p className="mb-3 text-sm">Open a new terminal window:</p>
              <div className="bg-[--foreground]/5 p-4 rounded-lg border border-[--border] overflow-x-auto">
                <pre className="text-sm font-mono text-[--foreground]/90">
                  <code>
{`cd frontend
npm run dev
# The frontend will be available at http://localhost:3000`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
