export default abstract class Excluder {
  protected abstract isValid<T extends { id: number }>(media: T): boolean;

  public getValid<T extends { id: number }>(media: T[]) {
    return media.filter(this.isValid);
  }
}
