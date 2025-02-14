import { Meta, MetaProvider, Title } from "@solidjs/meta";
import SiteHead from "../../data/siteHead";

export default function Head() {
  return (
    <MetaProvider>
      <Title>{SiteHead.title()}</Title>
      <Meta name="description" content="Muhammad Naufal Hilmy Makarim's blog" />
    </MetaProvider>
  );
}
