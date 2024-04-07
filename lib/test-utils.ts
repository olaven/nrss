import { fakerNB_NO as faker } from "npm:@faker-js/faker";
import { Series } from "./storage.ts";

function generateSeries(overrides: Partial<Series> = {}): Series {
  return {
    id: faker.word.words(1),
    title: faker.word.words(3),
    subtitle: faker.word.words(3),
    link: faker.internet.url(),
    imageUrl: faker.image.url(),
    lastFetchedAt: faker.date.recent(),
    episodes: new Array(faker.number.int({ min: 0, max: 100 }))
      .fill(null).map(() => ({
        title: faker.word.words(3),
        subtitle: faker.word.words(3),
        link: faker.internet.url(),
        url: faker.internet.url(),
        shareLink: faker.internet.url(),
        description: faker.lorem.paragraphs(2),
        id: faker.string.uuid(),
        date: faker.date.recent(),
        durationInSeconds: faker.number.int({
          min: 0,
          max: 3600,
        }),
        ...overrides,
      })),
  };
}

export const testUtils = {
  generateSeries,
};
