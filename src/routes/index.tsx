import { createFileRoute, Link } from "@tanstack/react-router";
import { Facebook, Instagram } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import extractionPoster from "@/assets/extraction-poster.png";
import furiosaPoster from "@/assets/furiosa-poster.jpg";
import ghostbustersPoster from "@/assets/ghostbusters-poster.png";
import heroPortrait from "@/assets/hero-portrait.jpg";
import mibPoster from "@/assets/mib-poster.png";
import rushPoster from "@/assets/rush-poster.jpeg";
import seaPoster from "@/assets/sea-poster.jpg";
import stageBanner from "@/assets/stage-banner.jpg";
import transformersPoster from "@/assets/transformers-poster.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chris Hemsworth — Film, Fitness & Fan Chat" },
      {
        name: "description",
        content:
          "A fan-made profile of Australian actor and producer Chris Hemsworth, from Home and Away to Thor, Extraction, and beyond.",
      },
      { property: "og:title", content: "Chris Hemsworth — Film, Fitness & Fan Chat" },
      {
        property: "og:description",
        content:
          "Explore Chris Hemsworth's screen career, standout roles, and work beyond the frame.",
      },
    ],
  }),
  component: Index,
});

const FILMS = [
  {
    year: "2011",
    title: "Thor",
    role: "Thor Odinson",
    note: "Marvel origin",
    url: "https://en.wikipedia.org/wiki/Thor_(film)",
    image: "https://en.wikipedia.org/wiki/Special:FilePath/Thor_(film)_poster.jpg",
  },
  {
    year: "2013",
    title: "Rush",
    role: "James Hunt",
    note: "Racing drama",
    url: "https://en.wikipedia.org/wiki/Rush_(2013_film)",
    image: rushPoster,
  },
  {
    year: "2017",
    title: "Thor: Ragnarok",
    role: "Thor Odinson",
    note: "Cosmic adventure",
    url: "https://en.wikipedia.org/wiki/Thor:_Ragnarok",
    image: "https://en.wikipedia.org/wiki/Special:FilePath/Thor_Ragnarok_poster.jpg",
  },
  {
    year: "2020",
    title: "Extraction",
    role: "Tyler Rake",
    note: "Action thriller",
    url: "https://en.wikipedia.org/wiki/Extraction_(2020_film)",
    image: extractionPoster,
  },
  {
    year: "2023",
    title: "Extraction 2",
    role: "Tyler Rake",
    note: "Netflix action",
    url: "https://en.wikipedia.org/wiki/Extraction_2",
    image: "https://en.wikipedia.org/wiki/Special:FilePath/Extraction_2_poster.jpg",
  },
  {
    year: "2024",
    title: "Furiosa",
    role: "Dementus",
    note: "Wasteland epic",
    url: "https://en.wikipedia.org/wiki/Furiosa:_A_Mad_Max_Saga",
    image: furiosaPoster,
  },
  {
    year: "2012",
    title: "The Avengers",
    role: "Thor Odinson",
    note: "Superhero ensemble",
    url: "https://en.wikipedia.org/wiki/The_Avengers_(2012_film)",
    image: "https://en.wikipedia.org/wiki/Special:FilePath/The_Avengers_(2012_film)_poster.jpg",
  },
  {
    year: "2015",
    title: "In the Heart of the Sea",
    role: "Owen Chase",
    note: "Historical adventure",
    url: "https://en.wikipedia.org/wiki/In_the_Heart_of_the_Sea_(film)",
    image: seaPoster,
  },
  {
    year: "2016",
    title: "Ghostbusters",
    role: "Kevin Beckman",
    note: "Supernatural comedy",
    url: "https://en.wikipedia.org/wiki/Ghostbusters_(2016_film)",
    image: ghostbustersPoster,
  },
  {
    year: "2018",
    title: "Avengers: Infinity War",
    role: "Thor Odinson",
    note: "Marvel event film",
    url: "https://en.wikipedia.org/wiki/Avengers:_Infinity_War",
    image: "https://en.wikipedia.org/wiki/Special:FilePath/Avengers_Infinity_War_poster.jpg",
  },
  {
    year: "2019",
    title: "Avengers: Endgame",
    role: "Thor Odinson",
    note: "Saga finale",
    url: "https://en.wikipedia.org/wiki/Avengers:_Endgame",
    image: "https://en.wikipedia.org/wiki/Special:FilePath/Avengers_Endgame_poster.jpg",
  },
  {
    year: "2019",
    title: "Men in Black: International",
    role: "Agent H",
    note: "Science-fiction comedy",
    url: "https://en.wikipedia.org/wiki/Men_in_Black:_International",
    image: mibPoster,
  },
  {
    year: "2022",
    title: "Thor: Love and Thunder",
    role: "Thor Odinson",
    note: "Marvel adventure",
    url: "https://en.wikipedia.org/wiki/Thor:_Love_and_Thunder",
    image: "https://en.wikipedia.org/wiki/Special:FilePath/Thor_Love_and_Thunder_poster.jpeg",
  },
  {
    year: "2024",
    title: "Transformers One",
    role: "Optimus Prime",
    note: "Animated adventure",
    url: "https://en.wikipedia.org/wiki/Transformers_One",
    image: transformersPoster,
  },
];

const MILESTONES = [
  {
    year: "2002–07",
    title: "Australian beginnings",
    text: "Early television work led to Kim Hyde in Home and Away, the role that first made him widely known at home.",
    url: "https://en.wikipedia.org/wiki/Home_and_Away",
  },
  {
    year: "2009",
    title: "A Hollywood introduction",
    text: "He appeared as George Kirk in Star Trek before making the leap to a global film career.",
    url: "https://en.wikipedia.org/wiki/Star_Trek_(film)",
  },
  {
    year: "2011–19",
    title: "The God of Thunder",
    text: "Thor and the Avengers films turned Hemsworth into one of the defining screen heroes of the Marvel era.",
    url: "https://en.wikipedia.org/wiki/Marvel_Cinematic_Universe",
  },
  {
    year: "2020–now",
    title: "Action with range",
    text: "Tyler Rake, Dementus, and a growing slate of dramatic and documentary work have widened the frame.",
    url: "https://en.wikipedia.org/wiki/Extraction_(2020_film)",
  },
  {
    year: "2012–19",
    title: "The ensemble years",
    text: "Alongside Thor, he became a recurring presence in the Avengers films, helping anchor Marvel's connected cinematic universe.",
    url: "https://en.wikipedia.org/wiki/Avengers_(Marvel_Cinematic_Universe)",
  },
  {
    year: "2022–now",
    title: "Stories beyond fiction",
    text: "Limitless with Chris Hemsworth brought health, longevity, and human performance into a documentary format.",
    url: "https://en.wikipedia.org/wiki/Limitless_with_Chris_Hemsworth",
  },
  {
    year: "2006",
    title: "A new audience",
    text: "A television appearance on Dancing with the Stars Australia added another chapter to his early public profile before Hollywood called.",
    url: "https://en.wikipedia.org/wiki/Dancing_with_the_Stars_(Australian_TV_series)",
  },
  {
    year: "2013",
    title: "A dramatic turn",
    text: "Playing Formula One champion James Hunt in Rush showed a more grounded side of his screen presence and earned strong critical attention.",
    url: "https://en.wikipedia.org/wiki/Rush_(2013_film)",
  },
  {
    year: "2014–now",
    title: "A wider platform",
    text: "His work expanded beyond acting through fitness, wellness, and documentary projects that connect performance with everyday health.",
    url: "https://en.wikipedia.org/wiki/Centr_(company)",
  },
  {
    year: "2021",
    title: "National recognition",
    text: "Hemsworth was appointed a Member of the Order of Australia, recognizing his contribution to the arts and charitable work.",
    url: "https://en.wikipedia.org/wiki/Order_of_Australia",
  },
];

function filmSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function Index() {
  const { user, isAdmin } = useAuth();

  return (
    <main>
      <section className="relative spotlight">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              Actor · Producer · Australian
            </p>
            <h1 className="mt-4 text-5xl leading-[0.95] md:text-7xl">
              Chris <span className="text-gold">Hemsworth</span>
            </h1>
            <p className="mt-5 max-w-md text-muted-foreground">
              From Melbourne and the Australian outback to the Marvel Cinematic Universe, Hemsworth
              built a career on physical commitment, comic timing, and a willingness to take on a
              new kind of role.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to={user ? (isAdmin ? "/admin" : "/chat") : "/auth"}>
                  {user ? (isAdmin ? "Open owner inbox" : "Open my chat") : "Chat with Chris"}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#films">See the films</a>
              </Button>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Chris_Hemsworth_by_Gage_Skidmore.jpg"
              alt="Cinematic portrait used for the Chris Hemsworth fan profile"
              width={1280}
              height={1600}
              className="w-full rounded-2xl object-cover glow"
            />
          </div>
        </div>
      </section>

      <section id="films" className="border-t border-border/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">On screen</p>
              <h2 className="mt-2 text-3xl">Selected work</h2>
            </div>
            <p className="max-w-sm text-right text-sm text-muted-foreground">
              A quick tour through superhero spectacle, grounded drama, and modern action cinema.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {FILMS.map((film) => (
              <article key={film.title} className="panel flex min-w-0 gap-3 p-3 sm:gap-4">
                <a
                  href={`/films/${filmSlug(film.title)}`}
                  aria-label={`Read about ${film.title} on Wikipedia`}
                  className="block w-20 shrink-0 sm:w-24"
                >
                  <img
                    src={film.image}
                    alt={`${film.title} poster`}
                    width="160"
                    height="240"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = heroPortrait;
                    }}
                    className="aspect-[2/3] w-full rounded-md object-cover transition-opacity hover:opacity-80"
                  />
                </a>
                <div className="min-w-0 py-1">
                  <p className="text-xs uppercase tracking-widest text-primary">{film.year}</p>
                  <h3 className="mt-1 text-lg leading-tight">
                    <a
                      href={`/films/${filmSlug(film.title)}`}
                      className="transition-colors hover:text-primary"
                    >
                      {film.title}
                    </a>
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                    {film.role} · {film.note}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">The timeline</p>
              <h2 className="mt-3 text-4xl">A career in motion</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Hemsworth's path runs from Australian television to some of the biggest franchises
                in modern cinema, with room along the way for independent experiments and real-world
                stories.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {MILESTONES.map((milestone) => (
                <article key={milestone.year} className="panel p-5">
                  <p className="text-xs uppercase tracking-widest text-primary">{milestone.year}</p>
                  <h3 className="mt-2 text-lg">
                    <a
                      href={milestone.url}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-primary"
                    >
                      {milestone.title}
                    </a>
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{milestone.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 md:grid-cols-3">
          <article>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Beyond the cape</p>
            <h2 className="mt-3 text-2xl">
              <a
                href="https://en.wikipedia.org/wiki/Centr_(company)"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-primary"
              >
                Fitness & wellbeing
              </a>
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              His training became part of the public conversation around Thor, later growing into
              Centr, a wellness platform built around movement, nutrition, and mindfulness.
            </p>
          </article>
          <article>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">On the record</p>
            <h2 className="mt-3 text-2xl">
              <a
                href="https://en.wikipedia.org/wiki/Byron_Bay"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-primary"
              >
                A grounded home
              </a>
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Hemsworth lives in Australia with his family and has spoken publicly about the value
              of time outdoors, family life, and keeping perspective away from the set.
            </p>
          </article>
          <article>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Giving back</p>
            <h2 className="mt-3 text-2xl">
              <a
                href="https://en.wikipedia.org/wiki/Partners_in_Health"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-primary"
              >
                Work with purpose
              </a>
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Alongside entertainment, he has supported charitable projects and used documentary
              work to explore health, resilience, and the stories behind the headlines.
            </p>
          </article>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-border/60">
        <img
          src={stageBanner}
          alt="Empty cinema seats lit by warm stage lights"
          width={1600}
          height={900}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative mx-auto w-full max-w-3xl px-4 py-20 text-center">
          <h2 className="text-4xl">Join the fan club</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Sign up with Google or an email address and get your own private thread for discussing
            films, characters, and the moments that stay with you.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to={user ? (isAdmin ? "/admin" : "/chat") : "/auth"}>
              {user ? "Go to my messages" : "Sign up free"}
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        <div className="flex justify-center gap-4">
          <a
            href="https://www.instagram.com/chrishemsworth/"
            target="_blank"
            rel="noreferrer"
            aria-label="Chris Hemsworth on Instagram"
            title="Instagram"
            className="transition-colors hover:text-primary"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href="https://www.facebook.com/ChrisHemsworth/"
            target="_blank"
            rel="noreferrer"
            aria-label="Chris Hemsworth on Facebook"
            title="Facebook"
            className="transition-colors hover:text-primary"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a
            href="https://x.com/chrishemsworth"
            target="_blank"
            rel="noreferrer"
            aria-label="Chris Hemsworth on X"
            title="X / Twitter"
            className="transition-colors hover:text-primary"
          >
            <span className="text-lg font-semibold leading-5">X</span>
          </a>
        </div>
        <a
          href="https://en.wikipedia.org/wiki/File:Chris_Hemsworth_Signature.svg"
          target="_blank"
          rel="noreferrer"
          aria-label="View Chris Hemsworth signature source"
          className="mt-5 inline-block transition-opacity hover:opacity-70"
        >
          <span
            role="img"
            aria-label="Chris Hemsworth signature"
            className="block h-20 w-56 bg-primary"
            style={{
              maskImage:
                "url(https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Chris_Hemsworth_Signature.svg/250px-Chris_Hemsworth_Signature.svg.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail)",
              maskPosition: "center",
              maskRepeat: "no-repeat",
              maskSize: "contain",
              WebkitMaskImage:
                "url(https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Chris_Hemsworth_Signature.svg/250px-Chris_Hemsworth_Signature.svg.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail)",
              WebkitMaskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
            }}
          />
        </a>
        <p className="mx-auto mt-4 max-w-xs leading-5">Chris Hemsworth's Fanbase website.</p>
        <p className="mx-auto mt-2 max-w-xs leading-5">
          Copyright &copy; 2026 . All rights reserved.
        </p>
      </footer>
    </main>
  );
}
