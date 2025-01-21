'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { processTask, concurrentProcessTask } from '../_actions/page.action';
import { runConcurrentAction } from '@/lib/concurrent-actions';
import { FaSpinner } from 'react-icons/fa';

type ExecutionStatus = {
  isRunning: boolean;
  executionTime?: number;
  results?: string;
};

const DEFAULT_STATUS: ExecutionStatus = { isRunning: false };

export default function ClientPage() {
  const [invocations, setInvocations] = useState(10);
  const [duration, setDuration] = useState(1000);

  const [apiRoutesStatus, setApiRoutesStatus] = useState<ExecutionStatus>(DEFAULT_STATUS);
  const [defaultActionsStatus, setDefaultActionsStatus] = useState<ExecutionStatus>(DEFAULT_STATUS);
  const [concurrentActionsStatus, setConcurrentActionsStatus] = useState<ExecutionStatus>(DEFAULT_STATUS);

  const generateMockData = () => {
    return Array.from({ length: invocations }, (_, i) => ({ n: i + 1, duration }));
  };

  const resetBenchmark = () => {
    setApiRoutesStatus(DEFAULT_STATUS);
    setDefaultActionsStatus(DEFAULT_STATUS);
    setConcurrentActionsStatus(DEFAULT_STATUS);
  };

  const handleBanchmark = async (setter :Dispatch<SetStateAction<ExecutionStatus>>, requests : Promise<unknown>[])=> {
    setter({ isRunning: true });
    const start = Date.now();
    const results = JSON.stringify(await Promise.all(requests));
    setter({ isRunning: false, executionTime: Date.now() - start, results });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // reset status
    resetBenchmark();
    // prepare the mock data
    const data = generateMockData();
    // benchmark API routes
    await handleBanchmark(
      setApiRoutesStatus,
      data.map(({ n, duration }) => fetch(`/api?n=${n}&duration=${duration}`).then((res) => res.json()))
    );
    // benchmark parallel server actions
    await handleBanchmark(
      setConcurrentActionsStatus,
      data.map((payload) => runConcurrentAction(concurrentProcessTask(payload)))
    );
    // benchmark default server actions
    await handleBanchmark(
      setDefaultActionsStatus,
      data.map((payload) => processTask(payload))
    );
  };

  const isRunning = apiRoutesStatus.isRunning || defaultActionsStatus.isRunning || concurrentActionsStatus.isRunning;

  return (
    <main className="container mx-auto px-4 py-8 ">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
          Concurrent Next.js Server Actions
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A sample project to benchmark Next.js{" "}
          <a
            href="https://nextjs.org/docs/app/building-your-application/routing/route-handlers"
            className="text-blue-600 hover:underline"
          >
            API requests
          </a>{" "}
          vs.{" "}
          <a
            href="https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations"
            className="text-blue-600 hover:underline"
          >
            server actions
          </a>{" "}
          vs.{" "}
          <a
            href="https://github.com/Pasquale-Favella/next-concurrent-server-actions"
            target="_blank"
            className="text-blue-600 hover:underline"
            rel="noreferrer"
          >
            concurrent server actions
          </a>
          .
        </p>
      </header>
      <section className="mb-12 bg-white p-8 rounded-xl shadow-lg">
        <form className="flex flex-col gap-6 mb-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="invocations" className="mb-2 text-sm font-medium text-gray-700">
                Invocations
              </label>
              <input
                id="invocations"
                type="number"
                required
                placeholder="Number of invocations"
                value={invocations}
                onChange={(e) => setInvocations(Number(e.target.value))}
                disabled={isRunning}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="duration" className="mb-2 text-sm font-medium text-gray-700">
                Duration (ms)
              </label>
              <input
                id="duration"
                type="number"
                required
                placeholder="Duration of invocation (ms)"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={isRunning}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isRunning}
            data-testid="run"
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition-all duration-200 ${
              isRunning
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500"
            }`}
          >
            {isRunning ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Running Benchmark...
              </span>
            ) : (
              "Run Benchmark"
            )}
          </button>
        </form>
      
        <table className="w-full mt-8">
          <thead>
            <tr>
              <th className="text-left pb-4 text-lg font-semibold text-gray-700">Method</th>
              <th className="text-left pb-4 text-lg font-semibold text-gray-700">Execution time</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "API Routes", status: apiRoutesStatus },
              { name: "Concurrent server actions", status: concurrentActionsStatus },
              { name: "Default server actions", status: defaultActionsStatus },
            ].map(({ name, status }) => (
              <tr key={name} className="border-t border-gray-200">
                <td className="py-4 text-gray-600">{name}</td>
                <td className="py-4">
                  {status.isRunning ? (
                    <span className="flex items-center text-blue-500">
                      <FaSpinner className="animate-spin mr-2" />
                      Running...
                    </span>
                  ) : status.executionTime ? (
                    <span className="font-medium text-gray-800">{status.executionTime} ms</span>
                  ) : (
                    <span className="text-gray-400">Not run</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <blockquote className="text-sm italic mt-8 text-gray-600 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
          🔍 All API fetches and server actions are invoked with{" "}
          <code className="bg-gray-200 px-1 py-0.5 rounded">Promise.all</code>.
        </blockquote>
      </section>
      <footer className="text-sm text-gray-600 text-center">
        Created by{" "}
        <a
          href="https://github.com/Pasquale-Favella"
          title="Favella Pasquale"
          target="_blank"
          className="text-blue-600 hover:underline"
          rel="noreferrer"
        >
          Favella Pasquale
        </a>
      </footer>
    </main>
  )
}