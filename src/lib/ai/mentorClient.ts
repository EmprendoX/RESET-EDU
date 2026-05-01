import type { MentorRequest, MentorResponse } from '@/types/ai';
import { businessProfileRepo } from '@/lib/business/businessProfileRepo';
import { nowIso, randomDelay, uid } from '@/lib/utils/time';
import { getMockMentorAnswer } from './prompts';

/**
 * Mentor client adapter.
 *
 * Phase 1 (current): always returns a mocked response with simulated latency.
 * Phase N (later): performs `fetch('/.netlify/functions/mentor-chat', ...)`.
 *
 * The PUBLIC SHAPE of the request/response is fixed from day 1 so swapping the
 * mock for a real backend call requires zero changes outside this file.
 */

export async function sendMentorMessage(
  request: MentorRequest,
): Promise<MentorResponse> {
  await randomDelay(700, 1400);

  const profile = await businessProfileRepo.get();
  const { answer, suggestedNoteTitle } = getMockMentorAnswer({
    mode: request.mentorMode,
    userMessage: request.userMessage,
    selectedText: request.selectedText,
    businessName: profile.business_name,
  });

  return {
    answer,
    messageId: uid('msg'),
    threadId: request.threadId ?? uid('thread'),
    createdAt: nowIso(),
    suggestedNoteTitle,
  };
}
