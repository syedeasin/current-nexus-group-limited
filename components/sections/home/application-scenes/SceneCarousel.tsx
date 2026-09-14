import Reveal from "@/components/ui/Reveal";
import SceneCard from "@/components/ui/SceneCard";
import Carousel from "@/components/ui/Carousel";
import { stagger, CONTENT_BASE_DELAY_MS } from "@/lib/motion/timing";

interface SceneCarouselCard {
  key: string;
  title: string;
  description: string;
  image: string;
  /** Omit for presentational cards — see `SceneCard`. */
  href?: string;
}

interface SceneCarouselProps {
  cards: SceneCarouselCard[];
  ariaLabel: string;
  previousLabel: string;
  nextLabel: string;
}

export default function SceneCarousel({
  cards,
  ariaLabel,
  previousLabel,
  nextLabel,
}: SceneCarouselProps) {
  return (
    <Carousel
      ariaLabel={ariaLabel}
      progressDelay={stagger(cards.length, CONTENT_BASE_DELAY_MS)}
      controls={{ previousLabel, nextLabel }}
    >
      {cards.map((card, index) => (
        <Reveal
          key={card.key}
          as="div"
          delay={stagger(index, CONTENT_BASE_DELAY_MS)}
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
