---
class: chapter
---

# 一人では無理だけど、Amazon Q Developer CLIとならできるリファクタリング

<div class="flush-right">
兼安　聡
</div>
</br>

## はじめに

みなさま、Amazon Q Developer CLIをご存知でしょうか？
AWSは、Amazon Q Developerという生成AIによる開発を支援するツールで、これをCLIから利用できるようにしたものがAmazon Q Developer CLIです。

世に多数あるAI開発支援ツールの一つですね。
じゃあ、Amazon Q Developer CLIはどんな風に役立つのか？という例として、本記事では私が最近行ったリファクタリングの例を紹介します。

## Amazon Q Developer CLIのセットアップ方法

リファクタリングの例を紹介する前に、Amazon Q Developer CLIのセットアップ方法について触れておきます。
詳細な手順は、参考リンクをご覧いただくとして、ここでは簡単な流れを紹介しておきます。

インストールはHomebrewを使ってインストールするのが一番簡単です。
Homebrewがインストールされていない場合は、参考リンクをご覧ください。

```bash
brew install amazon-q
```

インストールができたら、Amazon Q Developer にログインします。
Amazon Q Developer CLIのコマンドは、`q` で始まり、`q {subcommand}` の形式で実行します。

```bash
q login
```

インストール後、q コマンドを初めて実行すると認証を求められます。ブラウザが自動的に開き、認証ページへリダイレクトされます。
認証方法は以下の2種類から選択します。

- AWS Builder ID: 個人の学習や開発で利用する無料のプロファイルです。
- IAM Identity Center (旧 AWS SSO): 組織でAmazon Q Developer Proを利用している場合に選択します。管理者から提供された情報を使ってサインインします。

認証が完了すれば、利用可能になります。
Amazon Q Developer CLIは、`q chat` コマンドと入力すると、対話モードが始まります。

```bash
q chat
```

この後、`>` で始まるプロンプトが表示され、質問を入力できる状態になります。

## リファクタリングの題材

さて、ここからが本題です。
リファクタリングの題材となったリポジトリは、以下の特徴を持っています。

- Amazon ECS・AWS Lambdaをバックエンド
- プログラミング言語はPython
- Pythonのパッケージ管理はPipenv
- ECS・Lambdaのデプロイは、Infrastructure as Code (IaC) で実施
- デプロイ手順はREADME.mdに記載
- CI/CDはAWS CodePipelineを利用

ディレクトリ構成は以下のようになっています。

```bash
.
├── iac
├── src
│   ├── ecs
│   └── lambda           
├── Pipfile
├── Pipfile.lock
├── buildspec.yml
└── README.md
```

これが開発を経て以下のようにリポジトリ内に性質の異なるモジュールが混在している状態になりました。

```bash
.
├── another_module
│   ├── src
│   ├── tests
│   ├── Pipfile
│   ├── Pipfile.lock
│   └── README.md
├── iac
├── src
│   ├── ecs
│   └── lambda           
├── tests
├── Pipfile
├── Pipfile.lock
├── buildspec.yml
└── README.md
```

このような構成になってしまった理由は、増えたモジュールが元々あった機能と性質が異なるため、使用するライブラリにかなりの違いがあったからです。
当初から統合するかどうか議論がありましたが、スケジュール優先で放置してしまいました。

この状態の最大の問題は、デプロイ手順が複雑なことです。
必然的にbuildspec.ymlの内容も複雑となるので、CI/CDのメンテ負荷が高くなってしまいます。

## Amazon Q Developer CLIと一緒にリファクタリング

前項で述べたリポジトリを以下の構成にリファクタリングします。

### 目指すべき姿をドキュメントにまとめておく

uvを用いたモノレポ構成に変更し、モジュールごとに分離します。
uvを使うこと自体は、私が自力で検討したものです。

```bash
.
├── docs
│   └── design.md                    # リファクタリング設計書
├── modules
│   ├── another_module
│   │   ├── iac
│   │   ├── src
│   │   ├── tests
│   │   ├── pyproject.toml           # モジュール固有の依存関係定義
│   │   └── README.md
│   └── original_module
│       ├── iac
│       ├── src
│       │   ├── ecs
│       │   └── lambda           
│       ├── tests
│       ├── pyproject.toml           # モジュール固有の依存関係定義
│       └── README.md
├── scripts
│   ├── all_test.sh                  # 全モジュールのテスト一括実行スクリプト
│   └── all_deploy.sh                # 全モジュールのデプロイ一括実行スクリプト
├── buildspec.yml
├── pyproject.toml                   # ワークスペース全体の依存関係管理
├── uv.lock                          # uvによる依存関係ロックファイル
└── README.md
```

これを目指して、Amazon Q Developer CLIにリファクタリングを指示するプロンプトを入力していきます。
以下のような内容をマークダウン、例えば`design.md`というファイルに記載します。

```markdown

<上述のディレクトリ構成>

- 上記のディレクトリ構成になるようにリファクタリングします。
- uvのワークスペース機能を用いたモノレポ構成にします。
```

### Amazon Q Developer CLIへの指示を出してリファクタリングを進める

ドキュメントができたら、以下のようにAmazon Q Developer CLIに指示（プロンプト）を入力します。

```bash
> docs/design.mdに従い、リファクタリングをしていきます。uvを導入し、Pipfileの内容をpyproject.tomlに移行してください
```

そこからは、以下のように段階的にリファクタリングのプロンプトを入力していきます。

```bash
- pyproject.tomlの内容は、uvのワークスペース機能を利用して、親子関係を持つようにしてください。
- another_moduleをmodules配下に移動してください。
- リポジトリ直下にあった元のモジュールをmodules配下に移動し、ディレクトリ名をoriginal_moduleに変更してください。
- 各モジュールのREADME.mdに記載されているユニットテストの実行手順をまとめて、一括でテストを実行できるスクリプトをscripts配下に作成してください。
- 各モジュールのREADME.mdに記載されているデプロイ手順をまとめて、一括でデプロイできるスクリプトをscripts配下に作成してください。
```

実際には、段階的なプロンプトの途中で補足を入れたり、修正を加えたりしながら進めていきますので、プロンプトはこんな感じでリファクタリングを進めていくというイメージだと思ってください。
Amazon Q Developer CLIはプロンプトを受けて作業を始めると、変更を実際に反映するかどうかを確認してきます。
この時、`trust`を意味する`t`を入力することで、以降のプロンプトに対しても自動的に変更を反映するようになります。
都度確認されるとテンポが悪いので、指示を細かくして各作業は自動で進めてもらうのが効率が良いです。

```bash
Allow this action? Use 't' to trust (always allow) this tool for the session. [y/n/t]:
> t
```

デプロイの部分に関しては、作成してもらったデプロイスクリプトを実行してエラー調査もお願いしておきます。

```bash
> デプロイスクリプトを使ってデプロイを実行してください。エラーが発生したら、エラーを解消してリトライしてください。
```

これであとは、Amazon Q Developer CLIが試行錯誤をしながらリファクタリングを進めてくれます。
流石に途中で手動による微調整は必要でしたが、最終的には目指す姿に近い状態にリファクタリングが完了しました。

## リファクタリングに対するAmazon Q Developer CLIの効果

今回の例のリファクタリングにおいては、Amazon Q Developer CLIは大きな助けとなっています。
今回の例が主にディレクトリの構成変更とファイルの移動、Pipfileからpyproject.tomlへの移行、スクリプトの作成といった法則性があるリファクタリングだったからですね。
構成変更に合わせて、パスの整合性を保つための修正とそれを漏れなく行うことは人間がやるよりもAIの方が圧倒的に効率的かつ正確です。

煩雑だったデプロイ手順も、スクリプト化してもらいました。
スクリプトの作成は完全にAIの方がいいですね。
レガシーな技術ほど、AIの方が得意な印象があります。
また、デプロイのトライ＆エラーもAIに任せたことが大きな助けになりました。
デプロイのトライ＆エラーはとにかく手間がかかりますからね。

逆に気になったところは、一瞬勝手にプッシュするところまでやってしまう挙動を見せたことと、一時ファイルが大量に生成されてしまうことです。
前者は、作業をfeatureブランチで行っていたので実害はありませんが、びっくりするのでプロンプトで「勝手にプッシュしないでください」と指示しておくと良いでしょう。
後者は、他のAI開発ツールでは見られなかった挙動です。
他のAI開発ツールがメモリ上で行うことをファイルに書き出してやってることで、Amazon Q Developer CLIは安定性を保っているのかもしれません。
余計なファイルが多数できるのが邪魔なので、次回リファクタリングを行う際には、プロンプトで一時ファイルの置き場所を指定しておこうと思います。

まとめると、今回のリファクタリングは、一人では無理だけど、Amazon Q Developer CLIとならできました！ということで締めくくりたいと思います。

## 参考リンク

[Amazon Q Developer CLIのインストール方法と基本的な使い方](https://blog.serverworks.co.jp/amazon-q-cli-install-usage)

## 著者紹介

---

<div class="author-profile">
    <img src="images/chap-kaneyasu-refactor-with-amazonq/satoshi256kbyte.png" width="30%">
    <div>
        <div>
            <b>兼安 聡</b>
            @satoshi256kbyte
        </div>
    </div>
</div>
<p style="margin-top: 0.5em; margin-bottom: 2em;">
広島在住のDevOpsエンジニアです。</br>
今日も明日も修行中。</br>
好きな言葉はできらぁ！です。</br>
</p>
