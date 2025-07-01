import { VFM } from "@vivliostyle/vfm";

const isPrint = process.argv.includes("print.pdf");

const def = {
  //デフォルト２分でタイムアウトしちゃうので、ローカルコンパイル対応のため追加
  timeout: 300000,   // 5 分

  title: "LLM100kno", // populated into `publication.json`, default to `title` of the first entry or `name` in `package.json`.
  author: "oyakata <oyakata2438@gmail.com>", // default to `author` in `package.json` or undefined.
  language: "ja", // default to undefined.
  size: "JIS-B5", // JIS-B5: 教科書サイズ、A5: 最近流行りの小さいサイズの技術書
  theme: [
    "./fonts",
    "./theme-nice-techbook2",
  ],
  entry: [
    // 表紙
    // { rel: "cover" },

    // 扉
    // "00-title.md",
    "title.html",
    // 前書き
    "01-preface.md",

    // 目次
    { rel: "contents" },

    // 第一部
    "part-1-start.md",			//LLMの説明やはじめの一歩初級者向け
      "chap-otsukit-hellollm.md", // ここに追記していく
	  "chap-moritalous-token.md",
	  "chap-yokoykou-texttosql.md",
	  "chap-moritalous-nova.md",
      // TBD (追加お待ちしております)
      // 例）エージェントとマルチエージェント？

    /////////
    "part-2-terminology.md",			//LLMの専門用語や単語などを簡素にご紹介（ここが一番重要かも）
      "chap-otsukit-basic10word.md",
      "chap-otsukit-whatisvectorwithFeatureAmount.md",
      // ここに追記していく
      // TBD (追加お待ちしております)
      // 例）ナレッジベースって何？
      "chap-amixedcolor-chekhov's-gun-fallacy.md",


    /////////
    "part-3-howto.md",			      //LLMのいろいろなサービス、ツール、OSSなんかの使い方
      "chap-otsukit-just4UtheBedrock.md", // ここに追記していく
      "chap-kaneyasu-refactor-with-amazonq.md",
      // TBD (追加お待ちしております)
      // 例）ナレッジベース追加したら４万円でひやっとした話

    /////////
    "part-4-servicetool.md",			      //AWSユーザーから見たAWS関連のいろいろなサービス、ツール Bedrock 、Q、　GenUとかいろいろ
      "chap-kazzpapa3-find-aws-docs-with-amazonq.md",
      // TBD (追加お待ちしております)
      // 例）Q Developer と　Q Business って何が違うの？


    /////////
    "part-5-certificate.md",			      //AWSユーザーから見たAWS関連のいろいろなサービス、ツール Bedrock 、Q、　GenUとかいろいろ
      // TBD (追加お待ちしております)
      // 例）Q Developer と　Q Business って何が違うの？

    /////////
  	"part-6-community.md",					//コミュニティ、勉強会、つかおうぜ
	    "chap-oyakata-greetingcard.md",
      // 例）銀行でLLMは採用して使えるのか？

    ////////
    "part-x-xxxxx.md",			      //LLMのいろいろ((新しい章は追加していこうとおもいます))
        // TBD (追加お待ちしております)




  // 後書き
    "90-postscript.md",
    "98-authors.md",
    "99-colophon.md",
  ],
  entryContext: "./src",

  // output: [ // path to generate draft file(s). default to '{title}.pdf'
  //   './output.pdf', // the output format will be inferred from the name.
  //   {
  //     path: './book',
  //     format: 'webpub',
  //   },
  // ],
  workspaceDir: ".vivliostyle", // directory which is saved intermediate files.
  toc: {
    title: "目次", // title of table of contents. default to 'Contents'.
    sectionDepth: 2,
    includeCover: false, // include cover page in table of contents. default to 'false'.
  },
  // cover: './cover.png', // cover image. default to undefined.
  vfm: {
    // options of VFM processor
    //   hardLineBreaks: true, // converts line breaks of VFM to <br> tags. default to 'false'.
    //   disableFormatHtml: true, // disables HTML formatting. default to 'false'.
  },
};

if (isPrint) {
  def.theme = [
    ...def.theme,
    // グレースケール印刷可能なPDF
    "./theme-nice-techbook2/theme-print-pdf.css",
  ];
} else {
  def.theme = [
    ...def.theme,
    // オンライン向けのフルカラーPDF
    "./theme-nice-techbook2/theme-online-pdf.css",
    "./theme-nice-techbook2/theme-base/css/lib/prism/base.css",
    "./theme-nice-techbook2/theme-base/css/lib/prism/theme-okaidia.css",
  ];
}

export default def;
