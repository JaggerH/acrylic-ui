"use client"

import * as React from "react"
import {
  BookmarkIcon,
  ExternalLinkIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/acrylic/avatar"
import { Badge } from "@/registry/acrylic/badge"
import { Button } from "@/registry/acrylic/button"
import {
  ButtonGroup,
  ButtonGroupItem,
  ButtonGroupSeparator,
} from "@/registry/acrylic/button-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemMedia,
  ItemMeta,
  ItemSeparator,
  ItemTitle,
} from "@/registry/acrylic/item"

const posts = {
  wide: {
    source: "Video",
    time: "12m",
    title: "A landscape media post in the stream",
    description:
      "Landscape media fills the content column and keeps a wide preview, matching the compact thumb treatment used for video and article covers.",
    comments: "24",
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=960&auto=format&fit=crop",
    ],
  },
  portrait: {
    source: "Photo",
    time: "28m",
    title: "A portrait media post keeps its natural weight",
    description:
      "Vertical media stays left-aligned in the content column instead of stretching into a flat banner.",
    comments: "18",
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=720&auto=format&fit=crop",
    ],
  },
  two: {
    source: "Gallery",
    time: "41m",
    title: "Two photos render as a balanced pair",
    description:
      "A two-image post uses a simple left-right split so both images stay readable at feed scale.",
    comments: "31",
    images: [
      "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=720&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=720&auto=format&fit=crop",
    ],
  },
  multi: {
    source: "Gallery",
    time: "1h",
    title: "Many photos collapse into a compact grid",
    description:
      "Multi-image posts cap the visible grid and show the overflow count on the last tile.",
    comments: "57",
    images: [
      "https://images.unsplash.com/photo-1483058712412-4245e9b90334?q=80&w=640&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=640&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=640&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=640&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=640&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=640&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=640&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=640&auto=format&fit=crop",
    ],
  },
  long: {
    source: "Text",
    time: "2h",
    title: "A long text post expands in place",
    description:
      "Stream keeps short text readable inside the row, but longer posts start collapsed so the feed remains scannable. Expanding the post reveals the full text without changing the surrounding item structure. This is useful for dense timelines where the user wants to skim several posts before opening one in detail.",
    comments: "12",
    images: [],
  },
}

const comments = [
  {
    author: "Casey",
    handle: "casey",
    avatar: "https://github.com/maxleiter.png",
    body: "This layout keeps the media readable without turning the row into a full card.",
    time: "15m",
    location: "CA",
    replies: [
      {
        author: "Nora",
        handle: "nora",
        avatar: "https://github.com/evilrabbit.png",
        body: "The inline expand is the right behavior for long text in a dense stream.",
        time: "11m",
        location: "NY",
      },
      {
        author: "Mia",
        handle: "mia",
        avatar: "https://github.com/pacocoursey.png",
        body: "The gallery state feels close to the real stream. The comment rail should stay quiet like this.",
        time: "8m",
        location: "WA",
      },
    ],
  },
  {
    author: "Jordan",
    handle: "jordan",
    avatar: "https://github.com/rauchg.png",
    body: "Default Item works here as long as the nested surface does not add another panel.",
    time: "6m",
    location: "OR",
  },
  {
    author: "Lee",
    handle: "lee",
    avatar: "https://github.com/leerob.png",
    body: "Moving the metadata under the comment helps the text keep its full measure.",
    time: "3m",
    location: "TX",
  },
]

const tabs = [
  ["wide", "Wide"],
  ["portrait", "Tall"],
  ["two", "Two"],
  ["multi", "Grid"],
  ["long", "Text"],
] as const

type PostKind = keyof typeof posts

export default function PostDemo() {
  const [kind, setKind] = React.useState<PostKind>("wide")
  const [expanded, setExpanded] = React.useState(false)
  const [commentsOpen, setCommentsOpen] = React.useState(true)
  const post = posts[kind]
  const isLong = kind === "long"
  const bodyExpanded = isLong && expanded

  return (
    <div className="flex w-full max-w-xl flex-col items-start gap-3">
      <ButtonGroup
        variant="segmented"
        size="small"
        value={kind}
        onValueChange={(value) => {
          setKind(value as PostKind)
          setExpanded(false)
        }}
      >
        {tabs.map(([value, label]) => (
          <ButtonGroupItem key={value} value={value}>
            {label}
          </ButtonGroupItem>
        ))}
      </ButtonGroup>

      <ItemGroup className="w-full">
        <Item variant="outline" className="items-start">
          <ItemMedia variant="avatar">
            <Avatar>
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="Acrylic Design"
                className="grayscale"
              />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </ItemMedia>

          <ItemContent className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <ItemTitle>Acrylic Design</ItemTitle>
                <ItemDescription>@acrylic-ui · {post.time}</ItemDescription>
              </div>
              <Badge variant="secondary" size="sm">
                {post.source}
              </Badge>
            </div>

            <div>
              <ItemTitle className="text-[14px]">{post.title}</ItemTitle>
              <ItemDescription
                className={bodyExpanded ? "mt-1 line-clamp-none" : "mt-1 line-clamp-3"}
              >
                {post.description}
              </ItemDescription>
              {isLong ? (
                <Button
                  variant="ghost"
                  size="small"
                  className="px-0"
                  onClick={() => setExpanded((value) => !value)}
                >
                  {expanded ? "Collapse" : "Expand"}
                </Button>
              ) : null}
              <PostMedia kind={kind} images={post.images} />
            </div>

            <ItemFooter className="pt-0">
              <ButtonGroup size="small">
                <Button
                  variant="neutral"
                  size="small"
                  aria-pressed={commentsOpen}
                  onClick={() => setCommentsOpen((value) => !value)}
                >
                  <MessageSquareIcon />
                  {post.comments}
                </Button>
                <ButtonGroupSeparator />
                <Button variant="neutral" size="small">
                  <BookmarkIcon />
                  Save
                </Button>
                <ButtonGroupSeparator />
                <Button variant="neutral" size="small">
                  <ExternalLinkIcon />
                  Open
                </Button>
              </ButtonGroup>
            </ItemFooter>

            {commentsOpen ? (
              <div className="flex flex-col">
                <ItemSeparator />
                {comments.map((comment) => (
                  <React.Fragment key={comment.handle}>
                    <CommentItem comment={comment} />
                    {comment.replies?.map((reply) => (
                      <CommentItem key={reply.handle} comment={reply} reply />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            ) : null}
          </ItemContent>

          <ItemActions>
            <Button variant="ghost" size="medium" icon aria-label="More options">
              <MoreHorizontalIcon />
            </Button>
          </ItemActions>
        </Item>
      </ItemGroup>
    </div>
  )
}

type Comment = {
  author: string
  handle: string
  avatar: string
  body: string
  time: string
  location: string
  replies?: Comment[]
}

function CommentItem({
  comment,
  reply = false,
}: {
  comment: Comment
  reply?: boolean
}) {
  return (
    <Item variant="default" size="xs" className={reply ? "ml-10" : undefined}>
      <ItemMedia variant="avatar">
        <Avatar>
          <AvatarImage src={comment.avatar} alt={comment.author} className="grayscale" />
          <AvatarFallback>{comment.author.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          {comment.author}{" "}
          <span className="font-normal text-muted-foreground">
            @{comment.handle}
          </span>
        </ItemTitle>
        <ItemDescription className="line-clamp-none text-foreground">
          {comment.body}
        </ItemDescription>
        <ItemMeta>
          {comment.time} · {comment.location}
        </ItemMeta>
      </ItemContent>
    </Item>
  )
}

function PostMedia({
  kind,
  images,
}: {
  kind: PostKind
  images: string[]
}) {
  if (images.length === 0) {
    return null
  }

  if (kind === "portrait") {
    return (
      <div className="mt-2 w-[180px] overflow-hidden rounded-[12px] bg-[var(--acr-card-nested)]">
        <img src={images[0]} alt="" className="aspect-[3/4] size-full object-cover" />
      </div>
    )
  }

  if (kind === "two") {
    return (
      <div className="mt-2 grid max-w-md grid-cols-2 gap-1.5">
        {images.map((image) => (
          <div
            key={image}
            className="overflow-hidden rounded-[10px] bg-[var(--acr-card-nested)]"
          >
            <img src={image} alt="" className="aspect-[4/5] size-full object-cover" />
          </div>
        ))}
      </div>
    )
  }

  if (kind === "multi") {
    const shown = images.slice(0, 6)
    const overflow = images.length - shown.length

    return (
      <div className="mt-2 grid max-w-md grid-cols-3 gap-1.5">
        {shown.map((image, index) => {
          const showOverflow = index === shown.length - 1 && overflow > 0

          return (
            <div
              key={`${image}-${index}`}
              className="relative overflow-hidden rounded-[9px] bg-[var(--acr-card-nested)]"
            >
              <img src={image} alt="" className="aspect-square size-full object-cover" />
              {showOverflow ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">
                  +{overflow}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="mt-2 max-w-md overflow-hidden rounded-[12px] bg-[var(--acr-card-nested)]">
      <img src={images[0]} alt="" className="aspect-video size-full object-cover" />
    </div>
  )
}
