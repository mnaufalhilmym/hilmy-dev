import { gql } from "@apollo/client/core";
import { A, useSearchParams } from "@solidjs/router";
import { DateTime } from "luxon";
import {
  createMemo,
  createRenderEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import toast from "solid-toast";
import { GqlClient } from "../../api/gqlClient";
import Search from "../../component/search/Search";
import { SitePathData } from "../../data/sitePathData";
import SiteHead from "../../data/siteHead";
import Loading from "../../component/loading/Loading";

async function fetchPosts({
  search,
  tag,
  page,
}: {
  search?: string;
  tag?: string;
  page: number;
}) {
  const client = GqlClient.client;

  try {
    const result = await client.query<{ posts: Post }>({
      query: gql`
        query Posts($search: String, $tag: String, $page: Int!) {
          posts(
            publicationState: LIVE
            filters: {
              or: [
                { title: { containsi: $search } }
                { content: { containsi: $search } }
              ]
              and: [{ post_tags: { title: { eq: $tag } } }]
            }
            sort: ["datetime:desc", "publishedAt:desc"]
            pagination: { page: $page, pageSize: 15 }
          ) {
            meta {
              pagination {
                page
                pageCount
              }
            }
            data {
              id
              attributes {
                title
                datetime
                post_tags {
                  data {
                    attributes {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        search,
        tag,
        page,
      },
      fetchPolicy: "cache-first",
    });

    if (result.errors) throw result.errors;

    return result.data.posts;
  } catch (e) {
    toast.error(`Error: ${e?.toString()}`);
  }
}

export default function HomeScreen() {
  let bottomPostElRef: HTMLDivElement | undefined;
  const [searchParams, setSearchParams] = useSearchParams<{
    search?: string;
    tag?: string;
  }>();
  const [processedPostData, setProcessedPostData] = createSignal<
    ProcessedPostData[]
  >([]);
  const [tags, setTags] = createSignal<string[]>([]);
  const [postMeta, setPostMeta] = createSignal<PostMeta>();
  const [page, setPage] = createSignal(1);
  const [isLoadingFetchPosts, setIsLoadingFetchPosts] = createSignal(true);

  createRenderEffect(() => {
    SiteHead.title = undefined;
  });

  createRenderEffect(() => {
    const search = searchParams.search;
    const tag = searchParams.tag;
    const _page = page();

    (async () => {
      setIsLoadingFetchPosts(true);
      const postsData = await fetchPosts({ search, tag, page: _page });
      if (postsData?.data) {
        const pdata = manipulatePostsData({
          prevPostData: processedPostData(),
          prevTags: tags(),
          newPostData: postsData.data,
        });
        setProcessedPostData(pdata.postData);
        setTags(pdata.tags);
        setPostMeta(postsData.meta);
      }
      setIsLoadingFetchPosts(false);
      fetchPostsWhenBottomPostElInViewport();
    })();
  });

  onMount(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (isAllFetched()) {
          if (bottomPostElRef) observer.unobserve(bottomPostElRef);
          return;
        }
        nextPage();
      }
    });

    if (bottomPostElRef) {
      observer.observe(bottomPostElRef);
    }

    onCleanup(() =>
      bottomPostElRef ? observer.unobserve(bottomPostElRef) : undefined
    );
  });

  const isAllFetched = createMemo(() => {
    const pagination = postMeta()?.pagination;
    if (pagination && pagination.page >= pagination.pageCount) {
      return true;
    }
    return false;
  });

  function fetchPostsWhenBottomPostElInViewport() {
    const rect = bottomPostElRef?.getBoundingClientRect();
    if (!rect) return;
    if (rect.top <= document.documentElement.clientHeight) {
      nextPage();
    }
  }

  function setSearchValue(search?: string) {
    setSearchParams({ search });
    setProcessedPostData([]);
    setTags([]);
    setPage(1);
  }

  function selectTag(tag: string) {
    setSearchParams({ tag: searchParams.tag === tag ? undefined : tag });
    setProcessedPostData([]);
    setTags([tag]);
    setPage(1);
  }

  function nextPage() {
    if (isLoadingFetchPosts() || isAllFetched()) return;
    setPage((prev) => prev + 1);
  }

  return (
    <>
      {/* Start of page header */}
      <div>
        <h1 class="font-bold text-2xl">Muhammad Naufal Hilmy Makarim</h1>
        <div class="flex flex-wrap gap-4 text-sm">
          <A href={SitePathData.aboutPath} title="About">
            🧑
          </A>
          <A href={SitePathData.toolsPath} title="Tools">
            🛠️
          </A>
          <A href={SitePathData.projectsPath} title="Past Projects">
            👨‍💻
          </A>
        </div>
      </div>
      {/* End of page header */}

      {/* Start of searchbar */}
      <div class="mt-8">
        <Search
          value={searchParams.search ?? ""}
          executeSearch={setSearchValue}
        />
        <Show when={tags().length > 0}>
          <div class="mt-1.5 flex flex-wrap gap-2">
            <For each={tags()}>
              {(tag) => (
                <button
                  onclick={() => selectTag(tag)}
                  class="px-2 py-0.5 bg-black/10 dark:bg-white/[.35] text-xs rounded-full space-x-0.5"
                >
                  <span>{tag}</span>
                  <Show when={searchParams.tag === tag}>
                    <span>✕</span>
                  </Show>
                </button>
              )}
            </For>
          </div>
        </Show>
      </div>
      {/* End of searchbar */}

      {/* Start of blog posts */}
      <div class="mt-14 space-y-10">
        <For each={processedPostData()}>
          {(data) => (
            <div>
              <span class="font-bold text-xl">{data.year}</span>
              <div class="space-y-2">
                <For each={data.posts}>
                  {(post) => (
                    <div class="flex gap-x-4 items-center">
                      <span class="w-16 flex-none">{post.dayAndMonth}</span>
                      <div>
                        <A href={`/post/${post.id}`}>{post.title}</A>
                        <div class="flex flex-wrap gap-2">
                          <For each={post.tags}>
                            {(tag) => (
                              <span class="px-2 py-0.5 bg-black/10 dark:bg-white/[.35] text-xs rounded-full">
                                {tag}
                              </span>
                            )}
                          </For>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
        <div ref={bottomPostElRef} />
        {/* End of blog posts */}

        {/* Start of button next page */}
        <Show when={!isLoadingFetchPosts() && !isAllFetched()}>
          <div>
            <button onclick={nextPage} class="block mx-auto">
              Load next page
            </button>
          </div>
        </Show>
        {/* End of button next page */}

        {/* Start of loading posts indicator */}
        <Show when={isLoadingFetchPosts()}>
          <Loading />
        </Show>
        {/* End of loading posts indicator */}

        {/* Start of empty posts indicator */}
        <Show when={!isLoadingFetchPosts() && processedPostData().length === 0}>
          <span>No posts found.</span>
        </Show>
        {/* End of empty posts indicator */}
      </div>
    </>
  );
}

function manipulatePostsData({
  prevPostData,
  prevTags,
  newPostData,
}: {
  prevPostData: ProcessedPostData[];
  prevTags: string[];
  newPostData: PostData[];
}) {
  let processedPostData: ProcessedPostData[];
  if (structuredClone) {
    processedPostData = structuredClone(prevPostData);
  } else {
    processedPostData = JSON.parse(JSON.stringify(prevPostData));
  }
  const tags = [...prevTags];

  newPostData.forEach((data) => {
    const date = DateTime.fromISO(data.attributes.datetime);
    const year = date.toFormat("yyyy");
    const index = processedPostData.findIndex((pdata) => pdata.year === year);
    const day = Number(date.toFormat("dd"));
    if (index === -1) {
      processedPostData.push({
        year,
        posts: [],
      });
    }
    processedPostData[
      index === -1 ? processedPostData.length - 1 : index
    ].posts.push({
      id: data.id,
      title: data.attributes.title,
      dayAndMonth: `${date.toFormat("LLL")} ${day < 10 ? `0${day}` : day}`,
      tags: data.attributes.post_tags.data.map((tag) => tag.attributes.title),
    });
    data.attributes.post_tags.data.forEach((tag) => {
      const index = tags.indexOf(tag.attributes.title);
      if (index === -1) {
        tags.push(tag.attributes.title);
      }
    });
  });
  return { postData: processedPostData, tags };
}

declare interface Post {
  meta: PostMeta;
  data: PostData[];
}

declare interface PostMeta {
  pagination: {
    page: number;
    pageCount: number;
  };
}

declare interface PostData {
  id: string;
  attributes: {
    title: string;
    datetime: string;
    post_tags: {
      data: {
        attributes: {
          title: string;
        };
      }[];
    };
  };
}

declare interface ProcessedPostData {
  year: string;
  posts: {
    id: string;
    title: string;
    dayAndMonth: string;
    tags: string[];
  }[];
}
