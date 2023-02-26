import { createRenderEffect } from "solid-js";
import UnderConstruction from "../../component/underConstruction/UnderConstruction";
import { SiteHead } from "../../data/siteHead";

export default function ProjectItemScreen() {
  createRenderEffect(() => {
    SiteHead.setTitle();
  });

  return <UnderConstruction />;
}
