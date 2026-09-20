import PageBanner from "@/components/sections/shared/PageBanner";
import CaseStudySection from "@/components/sections/shared/CaseStudySection";
import CtaBand from "@/components/sections/shared/CtaBand";
import SolutionsStats from "./SolutionsStats";
import SolutionsWhyChoose from "./SolutionsWhyChoose";
import SolutionsProductModels from "./SolutionsProductModels";
import SolutionsApplications from "./SolutionsApplications";
import { resolveSolutionIcon } from "@/lib/solutions-projects/icons";
import type { SolutionPageContent } from "@/lib/solutions-projects/types";

/**
 * The single reusable Solutions & Projects page renderer. Every page in this
 * section — Residential and all its siblings — is this template populated with
 * `SolutionPage.content`. Sections render in a fixed order; any optional section
 * absent from the data is skipped. No page-specific JSX lives anywhere else.
 */
export default function SolutionsProjectTemplate({ content }: { content: SolutionPageContent }) {
  const { hero, stats, whyChoose, productModels, applications, caseStudy, cta } = content;

  const centered = (hero.layout ?? "centered") === "centered";

  return (
    <main>
      <PageBanner
        eyebrowLabel={hero.eyebrow}
        heading={hero.heading}
        description={hero.description}
        image={{ src: hero.backgroundImage }}
        textMaxWidthClassName={centered ? "max-w-606" : "max-w-855"}
        containerClassName={
          centered
            ? "h-460 justify-center pt-56 md:h-560 xl:h-660 xl:pt-88"
            : "h-400 justify-end py-64 md:h-460 xl:h-548 xl:pt-140 xl:pb-120"
        }
      />

      {stats ? <SolutionsStats items={stats.items} /> : null}
      {whyChoose ? <SolutionsWhyChoose {...whyChoose} /> : null}
      {productModels ? <SolutionsProductModels {...productModels} /> : null}
      {applications ? <SolutionsApplications {...applications} /> : null}

      {caseStudy ? (
        <CaseStudySection
          eyebrowLabel={caseStudy.eyebrow}
          heading={caseStudy.heading}
          backgroundImage={caseStudy.backgroundImage}
          title={caseStudy.title}
          body={caseStudy.body}
          headingClassName="tracking-[-1.2px]!"
          gradientCss="linear-gradient(180deg, rgba(10,13,27,0) 38.01%, rgba(10,13,27,0.9) 70.03%)"
          contentRowClassName="relative flex flex-col gap-24 p-24 min-[480px]:p-32 lg:absolute lg:inset-x-0 lg:bottom-0 lg:flex-row lg:items-center lg:justify-between lg:gap-40 lg:p-60"
          dividerClassName="hidden w-0 border-l border-white/20 lg:block lg:h-108"
          titleClassName="text-white tracking-[-0.5px]!"
          bodySize="p3"
          specItemClassName="flex items-center gap-8 text-p3 font-medium text-white"
          specs={caseStudy.specs.map((spec) => {
            const Icon = resolveSolutionIcon(spec.icon);
            return {
              icon: <Icon size={20} className="shrink-0 text-white" aria-hidden="true" />,
              text: spec.text,
            };
          })}
        />
      ) : null}

      {cta ? (
        <CtaBand
          heading={cta.heading}
          subtext={cta.subtext}
          primaryCta={cta.primary}
          secondaryCta={cta.secondary}
          image={cta.image}
        />
      ) : (
        <CtaBand />
      )}
    </main>
  );
}
