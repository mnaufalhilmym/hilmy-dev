import { gql } from "@apollo/client/core";
import { A, useNavigate, useParams } from "@solidjs/router";
import { marked } from "marked";
import moment from "moment";
import {
  createRenderEffect,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import toast from "solid-toast";
import { GqlClient } from "../../api/gqlClient";
import EmptyIndicator from "../../component/indicator/EmptyIndicator";
import { DarkModeData } from "../../data/darkModeData";
import { SitePathData } from "../../data/sitePathData";
import styles from "./PostScreen.module.css";
import SiteHead from "../../data/siteHead";
import Loading from "../../component/loading/Loading";

async function fetchPost({ id }: { id: string }) {
  const client = GqlClient.client;

  try {
    const result = await client.query<{ post: Post }>({
      query: gql`
        query Post($id: ID!) {
          post(id: $id) {
            data {
              attributes {
                title
                datetime
                content
                post_tags {
                  data {
                    attributes {
                      title
                    }
                  }
                }
                publishedAt
              }
            }
          }
        }
      `,
      variables: {
        id,
      },
      fetchPolicy: "cache-first",
    });

    if (result.errors) throw result.errors;

    const resultPrevNext = await client.query<{
      prev: { data: PrevNextPostData[] };
      next: { data: PrevNextPostData[] };
    }>({
      query: gql`
        query PrevNextPosts($datetime: DateTime!, $publishedAt: DateTime!) {
          prev: posts(
            publicationState: LIVE
            filters: {
              and: [
                {
                  datetime: { lte: $datetime }
                  publishedAt: { lt: $publishedAt }
                }
              ]
            }
            sort: ["datetime:desc", "publishedAt:desc"]
            pagination: { limit: 1 }
          ) {
            data {
              id
              attributes {
                title
              }
            }
          }
          next: posts(
            publicationState: LIVE
            filters: {
              and: [
                {
                  datetime: { gte: $datetime }
                  publishedAt: { gt: $publishedAt }
                }
              ]
            }
            sort: ["datetime:asc", "publishedAt:asc"]
            pagination: { limit: 1 }
          ) {
            data {
              id
              attributes {
                title
              }
            }
          }
        }
      `,
      variables: {
        datetime: result.data.post.data.attributes.datetime,
        publishedAt: result.data.post.data.attributes.publishedAt,
      },
      fetchPolicy: "cache-first",
    });

    if (resultPrevNext.errors) throw resultPrevNext.errors;

    return {
      post: result.data.post.data,
      prev: resultPrevNext.data.prev.data[0],
      next: resultPrevNext.data.next.data[0],
    };
  } catch (e) {
    toast.error(`Error: ${e?.toString()}`);
  }
}

export default function PostScreen() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [postData, setPostData] = createSignal<{
    prev?: PrevNextPostData;
    data: PostData;
    next?: PrevNextPostData;
  }>();
  const [isLoadingFetchPost, setIsLoadingFetchPost] = createSignal(true);

  createRenderEffect(() => {
    SiteHead.title = postData()?.data.attributes.title;
  });

  createRenderEffect(async () => {
    setPostData();
    setIsLoadingFetchPost(true);
    const postData = await fetchPost({ id: params.id });
    if (postData?.post) {
      setPostData({
        prev: postData.prev,
        data: manipulatePostData(postData.post),
        next: postData.next,
      });
    }
    setIsLoadingFetchPost(false);
  });

  onMount(() => {
    const onKeyUpListener = window.addEventListener("keyup", onKeyUp);

    onCleanup(() => window.removeEventListener("keyup", onKeyUp));
  });

  function onKeyUp(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowRight": {
        e.preventDefault();
        navigatePost("next");
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        navigatePost("prev");
        break;
      }
    }
  }

  function navigatePost(arrow: "next" | "prev") {
    switch (arrow) {
      case "next": {
        const id = postData()?.next?.id;
        if (!id) return;
        navigate(`${SitePathData.postPath}/${id}`);
        break;
      }
      case "prev": {
        const id = postData()?.prev?.id;
        if (!id) return;
        navigate(`${SitePathData.postPath}/${id}`);
        break;
      }
    }
  }

  return (
    <>
      <div class="py-4">
        {/* Start of blog post content */}
        <Show when={postData()?.data}>
          <h1 class="font-bold text-2xl">
            {postData()!.data.attributes.title}
          </h1>
          <p class="mt-2 text-sm text-black/70 dark:text-white/70 transition-colors">
            Published at{" "}
            {moment(postData()!.data.attributes.datetime).format(
              "MMMM DD, YYYY"
            )}
          </p>
          <p
            innerHTML={marked.parse(postData()!.data.attributes.content)}
            class={`max-w-full mt-8 text-justify break-words ${styles.content}`}
            classList={{ [`${styles["content-dark"]}`]: DarkModeData.get() }}
          />
        </Show>
        {/* End of blog post content */}

        {/* Start of blog post navigator */}
        <Show when={postData()}>
          <div class="mt-14 flex gap-x-8">
            <div class="flex-1">
              <Show when={postData()?.prev?.id}>
                <A
                  href={`${SitePathData.postPath}/${postData()!.prev!.id}`}
                  class="flex items-center gap-x-2"
                >
                  <span class="relative top-1 text-7xl">⬅️</span>
                  <p class="line-clamp-2">
                    {postData()!.prev!.attributes.title}
                  </p>
                </A>
              </Show>
            </div>
            <div class="flex-1">
              <Show when={postData()?.next?.id}>
                <A
                  href={`${SitePathData.postPath}/${postData()!.next!.id}`}
                  class="flex items-center gap-x-2"
                >
                  <p class="line-clamp-2">
                    {postData()!.next!.attributes.title}
                  </p>
                  <span class="relative top-1 text-7xl">➡️</span>
                </A>
              </Show>
            </div>
          </div>
        </Show>
        {/* End of blog post navigator */}

        {/* Start of loading post indicator */}
        <Show when={isLoadingFetchPost() && !postData()}>
          <Loading />
        </Show>
        {/* End of loading post indicator */}

        {/* Start of empty post indicator */}
        <Show when={!isLoadingFetchPost() && !postData()}>
          <EmptyIndicator />
        </Show>
        {/* End of empty post indicator */}
      </div>
    </>
  );
}

function manipulatePostData(postData: PostData) {
  const content = postData.attributes.content.replaceAll(
    "/uploads/",
    `${import.meta.env.VITE_BACKEND_ENDPOINT}/uploads/`
  );
  return { ...postData, attributes: { ...postData.attributes, content } };
}

declare interface PostData {
  id: string;
  attributes: {
    title: string;
    datetime: string;
    content: string;
    post_tags: {
      data: {
        attributes: {
          title: string;
        };
      }[];
    };
    publishedAt: string;
  };
}

declare interface Post {
  data: PostData;
}

declare interface PrevNextPostData {
  id: string;
  attributes: {
    title: string;
  };
}
