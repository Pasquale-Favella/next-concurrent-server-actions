'use server';

import { createConcurrentAction } from "@/lib/concurrent-actions";


export async function processTask({ n, duration }: { n: number; duration: number }) {
  console.log(`Running action ${n}...`);
  await new Promise((resolve) => setTimeout(resolve, duration));
  return { n };
}

export const concurrentProcessTask = createConcurrentAction(processTask);