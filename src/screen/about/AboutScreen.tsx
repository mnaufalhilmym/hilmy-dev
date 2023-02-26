import { gql } from "@apollo/client/core";
import { marked } from "marked";
import { createRenderEffect, createSignal, Show } from "solid-js";
import toast from "solid-toast";
import { GraphQLClient } from "../../api/graphqlClient";
import EmptyIndicator from "../../component/indicator/EmptyIndicator";
import LoadingSpinner from "../../component/loadingSpinner/LoadingSpinner";
import { SiteHead } from "../../data/siteHead";
import { SiteTitleData } from "../../data/siteTitleData";

async function fetchAbout() {
  const client = GraphQLClient.get();

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
  const [aboutData, setAboutData] = createSignal<AboutData>();
  const [isLoadingFetchAbout, setIsLoadingFetchAbout] = createSignal(true);

  createRenderEffect(() => {
    SiteHead.setTitle(SiteTitleData.aboutTitle);
  });

  createRenderEffect(async () => {
    setIsLoadingFetchAbout(true);
    const aboutData = await fetchAbout();
    if (aboutData?.data) {
      setAboutData(aboutData.data);
    }
    setIsLoadingFetchAbout(false);
  });

  return (
    <>
      {/* Start of content */}
      <Show when={aboutData()?.attributes.content}>
        <div innerHTML={marked.parse(aboutData()!.attributes.content)} />
      </Show>
      {/* End of content */}

      {/* Start of loading indicator */}
      <Show when={isLoadingFetchAbout() && !aboutData()}>
        <div class="w-fit mx-auto flex items-center gap-x-2">
          <LoadingSpinner />
          <span>Processing...</span>
        </div>
      </Show>
      {/* End of loading indicator */}

      {/* Start of empty data indicator */}
      <Show when={!isLoadingFetchAbout() && !aboutData()}>
        <EmptyIndicator />
      </Show>
      {/* End of empty data indicator */}
    </>
  );
}

declare type AboutData = {
  attributes: {
    content: string;
  };
};
