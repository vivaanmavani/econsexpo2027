import { faqs } from "@/content/faqs";
import { site } from "@/content/site";
import { EventStatus } from "@/components/EventStatus";

/** Everything needed to come along, inside the homepage's closing chapter. */
export function Attend() {
  return (
    <div className="at__grid">
      <dl className="at__facts">
        <div>
          <dt>Date</dt>
          <dd>
            <EventStatus className="es--inline" />
          </dd>
        </div>
        <div>
          <dt>Venue</dt>
          <dd>
            {site.venue.name}
            <br />
            {site.venue.address}
          </dd>
        </div>
        <div>
          <dt>Expected attendance</dt>
          <dd>{site.participants.label} from schools across Singapore</dd>
        </div>
      </dl>
      <div className="at__faq">
        <h3 className="pa__h3">Questions</h3>
        {faqs.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
