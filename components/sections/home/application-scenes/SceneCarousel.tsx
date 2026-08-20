import Reveal from "@/components/ui/Reveal";
import SceneCard from "@/components/ui/SceneCard";
import Carousel from "@/components/ui/Carousel";

interface SceneCarouselCard {
  key: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

interface SceneCarouselProps {
  cards: SceneCarouselCard[];
  ariaLabel: string;
  previousLabel: string;
  nextLabel: string;
}

/** Header cascade is eyebrow(0), heading(80) — cards pick up 80ms after that, on first entry only. */
const CARD_REVEAL_BASE_DELAY_MS = 160;
const CARD_REVEAL_STEP_MS = 80;

export default function SceneCarousel({
  cards,
  ariaLabel,
  previousLabel,
  nextLabel,
}: SceneCarouselProps) {
  return (
    <Carousel
      ariaLabel={ariaLabel}
      progressDelay={CARD_REVEAL_BASE_DELAY_MS + cards.length * CARD_REVEAL_STEP_MS}
      controls={{ previousLabel, nextLabel }}
    >
      {cards.map((card, index) => (
        <Reveal
          key={card.key}
          as="div"
          delay={CARD_REVEAL_BASE_DELAY_MS + index * CARD_REVEAL_STEP_MS}
          className="w-[85vw] shrink-0 [scroll-snap-align:start] min-[481px]:w-[64%] lg:w-[36%] xl:w-[32.1%]"
        >
          <SceneCard
            href={card.href}
            image={card.image}
            title={card.title}
            description={card.description}
            imageSizes="(min-width: 1280px) 32vw, (min-width: 1024px) 36vw, (min-width: 481px) 64vw, 85vw"
          />
        </Reveal>
      ))}
    </Carousel>
  );
}
