import type { ApplicatorInterface } from './applicator.types';
import { EmailApplicator } from './applicators/email.applicator';
import { InBerlinWohnenApplicator } from './applicators/in-berlin-wohnen.applicator';

const applicators: ApplicatorInterface[] = [new InBerlinWohnenApplicator(), new EmailApplicator()];

export function pickApplicator(sourceId: string): ApplicatorInterface | null {
    const found = applicators.find((applicator) => applicator.canHandle(sourceId));
    if (found === undefined) {
        return null;
    }
    return found;
}
