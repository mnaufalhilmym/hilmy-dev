import { SiteTitleData } from "../../data/siteTitleData";
import { GqlClient } from "../../api/gqlClient";
import { gql } from "@apollo/client/core";
import toast from "solid-toast";
import { For, Show, createRenderEffect, createSignal } from "solid-js";
import { A } from "@solidjs/router";
import SiteHead from "../../data/siteHead";
import Loading from "../../component/loading/Loading";
import EmptyIndicator from "../../component/indicator/EmptyIndicator";

async function fetchTools() {
  const client = GqlClient.client;

  try {
    const result = await client.query<{ tools: Tool }>({
      query: gql`
        query Tools {
          tools(sort: "publishedAt:desc") {
            data {
              id
              attributes {
                title
                iconUrl
                href
              }
            }
          }
        }
      `,
      fetchPolicy: "cache-first",
    });

    if (result.errors) throw result.errors;

    const tools: ProcessedToolData[] = await Promise.all(
      result.data.tools.data.map(async (data) => {
        let res = await (await fetch(data.attributes.iconUrl)).text();
        const insertAt = res.indexOf(">");
        const iconHtml =
          res.slice(0, insertAt) + 'fill="currentColor"' + res.slice(insertAt);

        return {
          id: data.id,
          attributes: {
            title: data.attributes.title,
            iconHtml,
            href: data.attributes.href,
          },
        };
      })
    );

    return tools;
  } catch (e) {
    toast.error(`Error: ${e?.toString()}`);
  }
}

export default function ToolsScreen() {
  const [toolsData, setToolsData] = createSignal<ProcessedToolData[]>([]);
  const [isLoadingFetchTools, setIsLoadingFetchTools] = createSignal(true);

  createRenderEffect(() => {
    SiteHead.title = SiteTitleData.toolsTitle;
  });

  createRenderEffect(async () => {
    setIsLoadingFetchTools(true);
    const toolsData = await fetchTools();
    if (toolsData) {
      setToolsData(toolsData);
    }
    setIsLoadingFetchTools(false);
  });

  return (
    <>
      {/* Start of tools list */}
      <Show when={toolsData().length > 0}>
        <div class="flex flex-wrap">
          <For each={toolsData()}>
            {(data) => (
              <div class="w-28 p-2 aspect-square">
                <A
                  href={data.attributes.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-full h-full p-2 flex flex-col hover:bg-teal-100/50 active:bg-teal-100/80 rounded-lg"
                >
                  <div class="min-h-0 min-w-0 flex-1 w-fit mx-auto flex items-center justify-center">
                    <div innerHTML={data.attributes.iconHtml} />
                  </div>
                  <span class="flex-none block text-center truncate">
                    {data.attributes.title}
                  </span>
                </A>
              </div>
            )}
          </For>
        </div>
      </Show>
      {/* End of tools list */}

      {/* Start of loading tools indicator */}
      <Show when={isLoadingFetchTools()}>
        <Loading />
      </Show>
      {/* End of loading tools indicator */}

      {/* Start of empty tools indicator */}
      <Show when={!isLoadingFetchTools() && toolsData().length === 0}>
        <EmptyIndicator />
      </Show>
      {/* End of empty tools indicator */}
    </>
  );
}

declare interface Tool {
  data: ToolData[];
}

declare interface ToolData {
  id: string;
  attributes: {
    title: string;
    iconUrl: string;
    href: string;
  };
}

declare interface ProcessedToolData {
  id: string;
  attributes: {
    title: string;
    iconHtml: string;
    href: string;
  };
}
