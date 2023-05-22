import { For, Show, createRenderEffect, createSignal } from "solid-js";
import { SiteTitleData } from "../../data/siteTitleData";
import SiteHead from "../../data/siteHead";
import { GqlClient } from "../../api/gqlClient";
import { gql } from "@apollo/client/core";
import toast from "solid-toast";
import Loading from "../../component/loading/Loading";
import { A } from "@solidjs/router";
import EmptyIndicator from "../../component/indicator/EmptyIndicator";

async function fetchProjects() {
  const client = GqlClient.client;

  try {
    const result = await client.query<{ projects: Project }>({
      query: gql`
        query Projects {
          projects(sort: "publishedAt:desc") {
            data {
              id
              attributes {
                title
                href
              }
            }
          }
        }
      `,
      fetchPolicy: "cache-first",
    });

    if (result.errors) throw result.errors;

    return result.data.projects;
  } catch (e) {
    toast.error(`Error: ${e?.toString()}`);
  }
}

export default function ProjectsScreen() {
  const [projectsData, setProjectsData] = createSignal<ProjectData[]>([]);
  const [isLoadingFetchProjects, setIsLoadingFetchProjects] =
    createSignal(true);

  createRenderEffect(() => {
    SiteHead.title = SiteTitleData.projectsTitle;
  });

  createRenderEffect(async () => {
    setIsLoadingFetchProjects(true);
    const projectsData = await fetchProjects();
    if (projectsData?.data) {
      setProjectsData(projectsData.data);
    }
    setIsLoadingFetchProjects(false);
  });

  return (
    <>
      {/* Start of projects list */}
      <Show when={projectsData().length > 0}>
        <div class="space-y-3">
          <For each={projectsData()}>
            {(data) => (
              <A
                href={data.attributes.href}
                target="_blank"
                rel="noopener noreferrer"
                class="block"
              >
                {data.attributes.title}
              </A>
            )}
          </For>
        </div>
      </Show>
      {/* End of projects list */}

      {/* Start of loading projects indicator */}
      <Show when={isLoadingFetchProjects()}>
        <Loading />
      </Show>
      {/* End of loading projects indicator */}

      {/* Start of empty projects indicator */}
      <Show when={!isLoadingFetchProjects() && projectsData().length === 0}>
        <EmptyIndicator />
      </Show>
      {/* End of empty projects indicator */}
    </>
  );
}

declare interface Project {
  data: ProjectData[];
}

declare interface ProjectData {
  id: string;
  attributes: {
    title: string;
    href: string;
  };
}
