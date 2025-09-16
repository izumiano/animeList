export default class AnimeEpisode {
  title: string;
  episodeNumber: number;
  watched: boolean;

  constructor(title: string, episodeNumber: number, watched: boolean) {
    this.title = title;
    this.episodeNumber = episodeNumber;
    this.watched = watched;
  }
}
