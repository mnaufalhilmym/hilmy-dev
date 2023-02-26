import { createRenderEffect } from "solid-js";
import UnderConstruction from "../../component/underConstruction/UnderConstruction";
import { SiteHead } from "../../data/siteHead";
import { SiteTitleData } from "../../data/siteTitleData";

export default function ToolsScreen() {
  createRenderEffect(() => {
    SiteHead.setTitle(SiteTitleData.toolsTitle);
  });

  return <UnderConstruction />;
}
