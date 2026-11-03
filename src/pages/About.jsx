import PageBand from "../components/PageBand";
import { station } from "../data/config";

export default function About() {
  return (
    <>
      <PageBand eyebrow="Who we are" title={`About ${station.name}`}>
        {station.fullName}. {station.tagline}
      </PageBand>
      <section className="container section">
        <p>The full story is written in a later step.</p>
      </section>
    </>
  );
}