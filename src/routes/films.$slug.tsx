import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroPortrait from "@/assets/hero-portrait.jpg";
import extractionPoster from "@/assets/extraction-poster.png";
import furiosaPoster from "@/assets/furiosa-poster.jpg";
import ghostbustersPoster from "@/assets/ghostbusters-poster.png";
import mibPoster from "@/assets/mib-poster.png";
import rushPoster from "@/assets/rush-poster.jpeg";
import seaPoster from "@/assets/sea-poster.jpg";
import transformersPoster from "@/assets/transformers-poster.jpg";

const MOVIES: Record<
  string,
  {
    title: string;
    year: string;
    role: string;
    note: string;
    image: string;
    summary: string;
    wiki: string;
  }
> = {
  thor: {
    title: "Thor",
    year: "2011",
    role: "Thor Odinson",
    note: "Marvel origin",
    image: "https://en.wikipedia.org/wiki/Special:FilePath/Thor_(film)_poster.jpg",
    summary:
      "Chris Hemsworth's first solo appearance as Thor introduced the Asgardian prince to the Marvel Cinematic Universe.",
    wiki: "https://en.wikipedia.org/wiki/Thor_(film)",
  },
  rush: {
    title: "Rush",
    year: "2013",
    role: "James Hunt",
    note: "Racing drama",
    image: rushPoster,
    summary:
      "Ron Howard's racing drama follows the rivalry between Formula One champions James Hunt and Niki Lauda.",
    wiki: "https://en.wikipedia.org/wiki/Rush_(2013_film)",
  },
  "thor-ragnarok": {
    title: "Thor: Ragnarok",
    year: "2017",
    role: "Thor Odinson",
    note: "Cosmic adventure",
    image: "https://en.wikipedia.org/wiki/Special:FilePath/Thor_Ragnarok_poster.jpg",
    summary: "Thor faces a new cosmic threat while rediscovering his sense of humor and purpose.",
    wiki: "https://en.wikipedia.org/wiki/Thor:_Ragnarok",
  },
  extraction: {
    title: "Extraction",
    year: "2020",
    role: "Tyler Rake",
    note: "Action thriller",
    image: extractionPoster,
    summary:
      "Tyler Rake is sent into Dhaka on a dangerous rescue mission in this fast-moving action thriller.",
    wiki: "https://en.wikipedia.org/wiki/Extraction_(2020_film)",
  },
  "extraction-2": {
    title: "Extraction 2",
    year: "2023",
    role: "Tyler Rake",
    note: "Netflix action",
    image: "https://en.wikipedia.org/wiki/Special:FilePath/Extraction_2_poster.jpg",
    summary:
      "After surviving his previous mission, Tyler Rake returns for another high-risk extraction.",
    wiki: "https://en.wikipedia.org/wiki/Extraction_2",
  },
  furiosa: {
    title: "Furiosa",
    year: "2024",
    role: "Dementus",
    note: "Wasteland epic",
    image: furiosaPoster,
    summary: "Hemsworth plays the charismatic warlord Dementus in George Miller's Mad Max saga.",
    wiki: "https://en.wikipedia.org/wiki/Furiosa:_A_Mad_Max_Saga",
  },
  "the-avengers": {
    title: "The Avengers",
    year: "2012",
    role: "Thor Odinson",
    note: "Superhero ensemble",
    image: "https://en.wikipedia.org/wiki/Special:FilePath/The_Avengers_(2012_film)_poster.jpg",
    summary: "Earth's heroes assemble as Thor joins the Avengers against a global threat.",
    wiki: "https://en.wikipedia.org/wiki/The_Avengers_(2012_film)",
  },
  "in-the-heart-of-the-sea": {
    title: "In the Heart of the Sea",
    year: "2015",
    role: "Owen Chase",
    note: "Historical adventure",
    image: seaPoster,
    summary:
      "A nineteenth-century whaling voyage becomes a fight for survival after disaster strikes at sea.",
    wiki: "https://en.wikipedia.org/wiki/In_the_Heart_of_the_Sea_(film)",
  },
  ghostbusters: {
    title: "Ghostbusters",
    year: "2016",
    role: "Kevin Beckman",
    note: "Supernatural comedy",
    image: ghostbustersPoster,
    summary:
      "Hemsworth brings comic timing to the role of the Ghostbusters' unexpectedly chaotic receptionist.",
    wiki: "https://en.wikipedia.org/wiki/Ghostbusters_(2016_film)",
  },
  "avengers-infinity-war": {
    title: "Avengers: Infinity War",
    year: "2018",
    role: "Thor Odinson",
    note: "Marvel event film",
    image: "https://en.wikipedia.org/wiki/Special:FilePath/Avengers_Infinity_War_poster.jpg",
    summary: "Thor and the Avengers confront Thanos in one of Marvel's largest cinematic events.",
    wiki: "https://en.wikipedia.org/wiki/Avengers:_Infinity_War",
  },
  "avengers-endgame": {
    title: "Avengers: Endgame",
    year: "2019",
    role: "Thor Odinson",
    note: "Saga finale",
    image: "https://en.wikipedia.org/wiki/Special:FilePath/Avengers_Endgame_poster.jpg",
    summary: "The Avengers make one final attempt to undo the damage caused by the Infinity War.",
    wiki: "https://en.wikipedia.org/wiki/Avengers:_Endgame",
  },
  "men-in-black-international": {
    title: "Men in Black: International",
    year: "2019",
    role: "Agent H",
    note: "Science-fiction comedy",
    image: mibPoster,
    summary:
      "Agent H investigates an intergalactic threat while navigating the secretive Men in Black.",
    wiki: "https://en.wikipedia.org/wiki/Men_in_Black:_International",
  },
  "thor-love-and-thunder": {
    title: "Thor: Love and Thunder",
    year: "2022",
    role: "Thor Odinson",
    note: "Marvel adventure",
    image: "https://en.wikipedia.org/wiki/Special:FilePath/Thor_Love_and_Thunder_poster.jpeg",
    summary:
      "Thor faces a new cosmic enemy while confronting questions about love, purpose, and heroism.",
    wiki: "https://en.wikipedia.org/wiki/Thor:_Love_and_Thunder",
  },
  "transformers-one": {
    title: "Transformers One",
    year: "2024",
    role: "Optimus Prime",
    note: "Animated adventure",
    image: transformersPoster,
    summary:
      "Hemsworth voices a young Optimus Prime in this animated origin story set on Cybertron.",
    wiki: "https://en.wikipedia.org/wiki/Transformers_One",
  },
};

const DETAILS: Record<
  string,
  { genre: string; director: string; cast: string; setting: string; format: string; why: string }
> = {
  thor: {
    genre: "Superhero / fantasy",
    director: "Kenneth Branagh",
    cast: "Tom Hiddleston, Natalie Portman, Anthony Hopkins",
    setting: "Asgard and Earth",
    format: "Feature film",
    why: "Thor established Hemsworth as a leading franchise performer and introduced the balance of myth, humor, and family drama that shaped the character.",
  },
  rush: {
    genre: "Sports drama",
    director: "Ron Howard",
    cast: "Daniel Brühl, Olivia Wilde, Alexandra Maria Lara",
    setting: "1970s Formula One circuit",
    format: "Feature film",
    why: "The film gave Hemsworth a grounded dramatic showcase as James Hunt, emphasizing charisma, rivalry, and the cost of elite competition.",
  },
  "thor-ragnarok": {
    genre: "Superhero / comedy",
    director: "Taika Waititi",
    cast: "Tom Hiddleston, Cate Blanchett, Tessa Thompson",
    setting: "Sakaar and Asgard",
    format: "Feature film",
    why: "Ragnarok reinvented Thor's tone with a bright cosmic palette, fast comic rhythm, and a stronger sense of ensemble adventure.",
  },
  extraction: {
    genre: "Action thriller",
    director: "Sam Hargrave",
    cast: "Rudhraksh Jaiswal, Randeep Hooda, Golshifteh Farahani",
    setting: "Dhaka, Bangladesh",
    format: "Netflix feature film",
    why: "Extraction introduced Tyler Rake as a physically battered but emotionally guarded rescue specialist built for practical action set pieces.",
  },
  "extraction-2": {
    genre: "Action thriller",
    director: "Sam Hargrave",
    cast: "Golshifteh Farahani, Adam Bessa, Olga Kurylenko",
    setting: "Georgia, Austria, and Prague",
    format: "Netflix feature film",
    why: "The sequel expands Tyler Rake's world with longer action passages and a story about survival, loyalty, and family responsibility.",
  },
  furiosa: {
    genre: "Action / science fiction",
    director: "George Miller",
    cast: "Anya Taylor-Joy, Tom Burke, Alyla Browne",
    setting: "The post-apocalyptic Wasteland",
    format: "Feature film",
    why: "Dementus gave Hemsworth a deliberately theatrical villain, allowing him to disappear into a strange and volatile character.",
  },
  "the-avengers": {
    genre: "Superhero / action",
    director: "Joss Whedon",
    cast: "Robert Downey Jr., Chris Evans, Scarlett Johansson",
    setting: "New York and the wider Marvel world",
    format: "Feature film",
    why: "The Avengers proved that separate hero stories could converge into a single global event with Thor at its mythic center.",
  },
  "in-the-heart-of-the-sea": {
    genre: "Historical adventure",
    director: "Ron Howard",
    cast: "Benjamin Walker, Cillian Murphy, Brendan Gleeson",
    setting: "The Pacific Ocean, 1820",
    format: "Feature film",
    why: "The survival drama places Hemsworth in a period world shaped by endurance, leadership, and the consequences of obsession.",
  },
  ghostbusters: {
    genre: "Supernatural comedy",
    director: "Paul Feig",
    cast: "Melissa McCarthy, Kristen Wiig, Kate McKinnon",
    setting: "New York City",
    format: "Feature film",
    why: "As Kevin, Hemsworth leans into physical comedy and an intentionally offbeat performance that plays against his action-star image.",
  },
  "avengers-infinity-war": {
    genre: "Superhero / action",
    director: "Anthony and Joe Russo",
    cast: "Robert Downey Jr., Josh Brolin, Mark Ruffalo",
    setting: "Earth and the cosmos",
    format: "Feature film",
    why: "Infinity War reunites Thor with the Avengers at a point of personal grief and gives him one of the film's most urgent emotional arcs.",
  },
  "avengers-endgame": {
    genre: "Superhero / action",
    director: "Anthony and Joe Russo",
    cast: "Robert Downey Jr., Scarlett Johansson, Jeremy Renner",
    setting: "Multiple points in time and space",
    format: "Feature film",
    why: "Endgame closes a major chapter of the Avengers story while giving Thor a vulnerable, unexpectedly comic path back toward purpose.",
  },
  "men-in-black-international": {
    genre: "Science-fiction comedy",
    director: "F. Gary Gray",
    cast: "Tessa Thompson, Rebecca Ferguson, Kumail Nanjiani",
    setting: "London and international locations",
    format: "Feature film",
    why: "Agent H pairs Hemsworth with Tessa Thompson for a globe-spanning science-fiction adventure built around partnership and hidden threats.",
  },
  "thor-love-and-thunder": {
    genre: "Superhero / comedy",
    director: "Taika Waititi",
    cast: "Natalie Portman, Christian Bale, Tessa Thompson",
    setting: "New Asgard and the outer cosmos",
    format: "Feature film",
    why: "The story revisits Thor's relationships and asks what heroism looks like after loss, change, and years of battles.",
  },
  "transformers-one": {
    genre: "Animation / science fiction",
    director: "Josh Cooley",
    cast: "Brian Tyree Henry, Scarlett Johansson, Keegan-Michael Key",
    setting: "Cybertron",
    format: "Animated feature film",
    why: "Transformers One explores the friendship and conflict that shaped two iconic Cybertronian leaders before they became rivals.",
  },
};

export const Route = createFileRoute("/films/$slug")({ component: FilmPage });

function FilmPage() {
  const { slug } = Route.useParams();
  const film = MOVIES[slug];
  const details = DETAILS[slug];
  if (!film) return <main className="mx-auto max-w-3xl px-4 py-16">Film not found.</main>;
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to selected work
        </Link>
      </Button>
      <article className="panel overflow-hidden">
        <div className="grid md:grid-cols-[minmax(220px,360px)_1fr]">
          <img
            src={film.image || heroPortrait}
            alt={`${film.title} poster`}
            className="h-full max-h-[620px] w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = heroPortrait;
            }}
          />
          <div className="p-6 sm:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              {film.year} · {film.note}
            </p>
            <h1 className="mt-3 text-4xl">{film.title}</h1>
            <p className="mt-4 text-sm text-muted-foreground">Chris Hemsworth as {film.role}</p>
            <p className="mt-8 max-w-xl text-base leading-7 text-muted-foreground">
              {film.summary}
            </p>
            <Button asChild className="mt-8">
              <a href={film.wiki} target="_blank" rel="noreferrer">
                View Wikipedia information <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        {details && (
          <div className="border-t border-border/60 p-6 sm:p-10">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Genre", details.genre],
                ["Director", details.director],
                ["Format", details.format],
                ["Setting", details.setting],
              ].map(([label, value]) => (
                <div key={label} className="border-l-2 border-primary/60 pl-3">
                  <p className="text-xs uppercase tracking-widest text-primary">{label}</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-2xl">Featured cast</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{details.cast}</p>
              </div>
              <div>
                <h2 className="text-2xl">Why it matters</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{details.why}</p>
              </div>
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
