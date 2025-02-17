import { gql } from "@apollo/client/core";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { createRenderEffect, createSignal, Show } from "solid-js";
import toast from "solid-toast";
import { GqlClient } from "../../api/gqlClient";
import EmptyIndicator from "../../component/indicator/EmptyIndicator";
import { SiteTitleData } from "../../data/siteTitleData";
import SiteHead from "../../data/siteHead";
import Loading from "../../component/loading/Loading";

async function fetchAbout() {
  const client = GqlClient.client;

  try {
    const result = await client.query<{ about: { data: AboutData } }>({
      query: gql`
        query About {
          about(publicationState: LIVE) {
            data {
              attributes {
                content
              }
            }
          }
        }
      `,
      fetchPolicy: "cache-first",
    });

    if (result.errors) throw result.errors;

    return result.data.about;
  } catch (e) {
    toast.error(`Error: ${e?.toString()}`);
  }
}

export default function AboutScreen() {
  const [aboutHTML, setAboutHTML] = createSignal<string>();
  const [isLoadingFetchAbout, setIsLoadingFetchAbout] = createSignal(true);

  createRenderEffect(() => {
    SiteHead.title = SiteTitleData.aboutTitle;
  });

  createRenderEffect(async () => {
    setIsLoadingFetchAbout(true);
    const aboutData = (await fetchAbout())?.data;
    if (aboutData) {
      setAboutHTML(
        DOMPurify.sanitize(await marked.parse(aboutData.attributes.content))
      );
    }
    setIsLoadingFetchAbout(false);
  });

  return (
    <>
      {/* Start of content */}
      <Show when={aboutHTML()}>
        <div innerHTML={aboutHTML()} />
      </Show>
      {/* End of content */}

      {/* Start of loading indicator */}
      <Show when={isLoadingFetchAbout() && !aboutHTML()}>
        <Loading />
      </Show>
      {/* End of loading indicator */}

      {/* Start of empty data indicator */}
      <Show when={!isLoadingFetchAbout() && !aboutHTML()}>
        <EmptyIndicator />
      </Show>
      {/* End of empty data indicator */}
    </>
  );
}

declare interface AboutData {
  attributes: {
    content: string;
  };
}
