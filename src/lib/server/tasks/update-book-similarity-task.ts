import { Status } from '$lib/task-info';
import Task from './task';

const CHUNKS = 20;
const TIME = 2000;

export default class UpdateBooksSimilarityTask extends Task {
	protected async _Run(): Promise<void> {
		// IMPLEMENT IV: fetch book - book combos that need similarity updated, update similarity
		// fetch all book combos with at least X reviews in common
		//   (see how big X is before running, this is a theoretical n^2 operation)
		// get list of id's for reviews
		// get all reviews for books
		// for each pair, store #reviews in common and review correlation
		for (let i = 0; i < CHUNKS; ++i) {
			await new Promise((res) => setTimeout(res, TIME / CHUNKS));
			let timeLeft = ((1 - i / CHUNKS) * TIME) / 1000;
			this.updateStatus({
				status: Status.IN_PROGRESS,
				message: `Updating book similarity (${timeLeft.toFixed(2)}s left)`,
				completion: i / CHUNKS,
			});
		}

		this.updateStatus({
			status: Status.SUCCESSFUL,
			message: `finished updating book similarity`,
			completion: 1,
		});
	}
}
