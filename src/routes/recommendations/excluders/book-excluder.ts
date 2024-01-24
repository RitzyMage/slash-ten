import Excluder from "./excluder";

type ExcludeObject = Record<number, any>;

const DUPLICATES: ExcludeObject = {
  60543254: "Tress of the Emerald Sea",
  3033944115: "The Way of Kings (1 of 5)",
  18394936: `The Emperor's Soul`,
  54191640: "The Well of Ascension",
};

const NOT_INTERESTED: ExcludeObject = {
  7932486: "The Wheel of time series by Robert Jordan (1-11)",
  18050012: "A Memory of Light (Wheel of Time #14)",
  1111600: "The Wheel of Time: Boxed Set (Wheel of Time, #1-8)",
  38744839: "Becoming by Obama, Michelle",
  29227774: "Light Bringer (Red Rising Saga, #6)",
};

const RELIGIOUS: ExcludeObject = {
  2737608: "Our Heritage",
  708921: "Stand a Little Taller",
};

const EXCLUDE_IDS: ExcludeObject = {
  ...DUPLICATES,
  ...NOT_INTERESTED,
  ...RELIGIOUS,
};

export default class BookExcluder extends Excluder {
  protected isValid<T extends { id: number }>(media: T): boolean {
    return !EXCLUDE_IDS[media.id];
  }
}
