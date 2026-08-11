import type { Locale } from '../core/types'

type Catalog = Record<string, string>

export const supportedLocales: readonly Locale[] = ['en', 'zh-Hans', 'ja']

export function normalizeLocale(value: string | null | undefined): Locale {
  return supportedLocales.includes(value as Locale) ? value as Locale : 'en'
}

export const catalogs: Record<Locale, Catalog> = {
  en: {
    'app.title': 'Open Table', 'app.subtitle': 'See the structure. Choose with reasons.', 'app.promise': 'Deterministic · private · teachable',
    'locale.label': 'Language', 'nav.primary': 'Primary', 'nav.table': 'Table', 'nav.history': 'Chronicle', 'nav.method': 'Method',
    'mode.holdem': "Texas Hold’em", 'mode.bridge': 'Contract Bridge', 'mode.guandan': 'Guandan',
    'mode.holdemDescription': 'A complete heads-up no-limit hand: blinds, four betting streets, all-in, fold and showdown settlement.',
    'mode.bridgeDescription': 'A five-trick, no-bidding teaching table for follow-suit, trump and partnership timing.',
    'mode.guandanDescription': 'A six-card single-pattern shedding lesson for initiative and partner awareness.',
    'limit.full': 'Complete hand rules', 'limit.bridgeMini': 'Beginner table · five tricks · fixed spade trump · bidding, dummy and contract scoring are not included.',
    'limit.guandanMini': 'Beginner table · one deck · singles only · tribute, level wildcards, bombs and full promotion scoring are not included.',
    'start.new': 'Deal a new lesson', 'start.resume': 'Resume table', 'start.seed': 'Replay seed', 'start.seedHelp': 'The same seed reproduces the same private deal. Keep it private during play.',
    'table.you': 'You', 'table.villain': 'Opponent', 'table.north': 'North', 'table.east': 'East', 'table.south': 'South · you', 'table.west': 'West',
    'table.right': 'Right opponent', 'table.partner': 'Partner', 'table.left': 'Left opponent', 'table.hidden': 'Hidden card',
    'table.pot': 'Pot', 'table.stack': 'Stack', 'table.community': 'Shared board', 'table.tricks': 'Tricks', 'table.current': 'Current play',
    'turn.yours': 'Your decision', 'turn.agent': '{actor} is deciding', 'turn.complete': 'Lesson complete',
    'decision.heading': 'Legal intentions', 'decision.preview': 'Preview · no state changed', 'decision.choose': 'Choose an intention to see what changes.',
    'decision.confirm': 'Confirm this action', 'decision.agentConfirm': 'Confirm one legal agent action', 'decision.cancel': 'Clear preview',
    'action.fold': 'Fold', 'action.check': 'Check', 'action.call': 'Call', 'action.bet': 'Bet', 'action.allInBet': 'Bet all-in', 'action.raise': 'Raise', 'action.allInRaise': 'Raise all-in',
    'action.playCard': 'Play this card', 'action.playSingle': 'Play single', 'action.pass': 'Pass',
    'evidence.exact': 'Exact rule fact', 'evidence.calculated': 'Calculated sample', 'evidence.authored': 'Authored principle',
    'facet.chips': 'Chip conservation', 'facet.chipsBody': 'Stacks, street contributions and pot still total the fixed 2,000 chips.',
    'facet.equity': 'Visible-card equity', 'facet.equityBody': 'Deterministic Monte Carlo against uniformly random legal unseen cards. It does not infer the opponent’s range.',
    'facet.purpose': 'Strategic purpose', 'facet.followSuit': 'Trick structure', 'facet.followSuitBody': 'Following the led suit is compulsory when that suit remains in hand.',
    'facet.structure': 'Pattern legality', 'facet.guandanStructureBody': 'This lesson compares single cards by rank only.', 'facet.partnership': 'Partnership lens',
    'strategy.fold': 'Release a losing investment when the price exceeds the hand’s credible path to win.',
    'strategy.check': 'Keep the pot stable and preserve the option to respond after gaining information.',
    'strategy.call': 'Match the price without reopening the betting. Compare the price with calculated equity, then consider future streets.',
    'strategy.bet': 'Claim value or fold equity while defining the price of the next decision.',
    'strategy.raise': 'Increase pressure and price. Ask which worse hands continue and which better hands fold.',
    'strategy.bridgePartnership': 'Your card is also a message. Preserve entries and notice what partner can safely win later.',
    'strategy.guandanPartnership': 'Initiative belongs to the team. Passing can preserve a high card when your partner already controls the lead.',
    'history.empty': 'No lessons yet.', 'history.title': 'Session chronicle', 'history.open': 'Open', 'history.revision': 'Revision', 'history.promise': 'Local · revision safe',
    'method.title': 'How evidence is kept honest', 'method.promise': 'Provenance before prose', 'method.exact': 'Exact comes only from deterministic rules: legal cards, chip totals, trick winners and settlement.',
    'method.calculated': 'Calculated values show their sampling assumption and sample count. They are evidence, not authority.',
    'method.authored': 'Authored strategy is transferable guidance. It can be useful without pretending to be a theorem.',
    'event.handStarted': 'Hand dealt', 'event.smallBlind': 'Small blind', 'event.bigBlind': 'Big blind', 'event.folded': 'Folded', 'event.fold': 'Folded',
    'event.check': 'Checked', 'event.call': 'Called', 'event.bet': 'Bet', 'event.raise': 'Raised', 'event.flop': 'Flop dealt', 'event.turn': 'Turn dealt', 'event.river': 'River dealt',
    'event.showdownWon': 'Won at showdown', 'event.foldWon': 'Won uncontested', 'event.splitPot': 'Split pot',
    'event.bridgeLessonStarted': 'Bridge lesson dealt', 'event.guandanLessonStarted': 'Guandan lesson dealt', 'event.cardPlayed': 'Played a card', 'event.passed': 'Passed',
    'event.trickWon': 'Won the trick', 'event.trickReset': 'Won initiative', 'event.bridgeLessonComplete': 'Bridge lesson complete', 'event.guandanLessonComplete': 'Guandan lesson complete',
    'hand.highCard': 'High card', 'hand.pair': 'One pair', 'hand.twoPair': 'Two pair', 'hand.trips': 'Three of a kind', 'hand.straight': 'Straight', 'hand.flush': 'Flush', 'hand.fullHouse': 'Full house', 'hand.quads': 'Four of a kind', 'hand.straightFlush': 'Straight flush',
    'status.winner': 'Winner: {actor}', 'status.teamScore': 'North–South {ns} · East–West {ew}', 'status.finish': 'Finish order: {order}', 'status.saved': 'Saved locally', 'status.persistenceConflict': 'Another update arrived first. The newest saved table has been restored; please choose again.', 'status.persistenceFailed': 'The table could not be saved. Nothing was committed; please try again.',
  },
  'zh-Hans': {
    'app.title': '开桌', 'app.subtitle': '看懂结构，有理有据地选择。', 'app.promise': '确定规则 · 隐私保护 · 可教学', 'locale.label': '语言', 'nav.primary': '主导航', 'nav.table': '牌桌', 'nav.history': '牌局纪事', 'nav.method': '方法',
    'mode.holdem': '德州扑克', 'mode.bridge': '合约桥牌', 'mode.guandan': '掼蛋',
    'mode.holdemDescription': '完整的无限注单挑一手牌：盲注、四轮下注、全下、弃牌和摊牌结算。',
    'mode.bridgeDescription': '五墩免叫牌教学桌，练习跟牌、将牌与搭档时机。', 'mode.guandanDescription': '六张牌、仅单张牌型的入门出完牌练习，学习牌权与搭档意识。',
    'limit.full': '完整单局规则', 'limit.bridgeMini': '入门桌 · 五墩 · 固定黑桃将牌 · 不含叫牌、明手和定约计分。',
    'limit.guandanMini': '入门桌 · 单副牌 · 仅单张 · 不含进贡、级牌百搭、炸弹及完整升级计分。',
    'start.new': '发一局新课', 'start.resume': '继续牌桌', 'start.seed': '复盘种子', 'start.seedHelp': '同一个种子会重现相同的暗牌。对局中请保密。',
    'table.you': '你', 'table.villain': '对手', 'table.north': '北家', 'table.east': '东家', 'table.south': '南家 · 你', 'table.west': '西家', 'table.right': '右手对家', 'table.partner': '搭档', 'table.left': '左手对家', 'table.hidden': '暗牌',
    'table.pot': '底池', 'table.stack': '筹码', 'table.community': '公共牌', 'table.tricks': '墩数', 'table.current': '当前出牌',
    'turn.yours': '轮到你选择', 'turn.agent': '{actor} 正在选择', 'turn.complete': '本课完成',
    'decision.heading': '合法意图', 'decision.preview': '预演 · 尚未改变牌局', 'decision.choose': '先选择一个意图，查看它会改变什么。', 'decision.confirm': '确认执行', 'decision.agentConfirm': '确认代理执行一个合法动作', 'decision.cancel': '取消预演',
    'action.fold': '弃牌', 'action.check': '过牌', 'action.call': '跟注', 'action.bet': '下注', 'action.allInBet': '全下', 'action.raise': '加注', 'action.allInRaise': '加注至全下', 'action.playCard': '打出此牌', 'action.playSingle': '出单张', 'action.pass': '不要',
    'evidence.exact': '精确规则事实', 'evidence.calculated': '计算抽样', 'evidence.authored': '教学原则',
    'facet.chips': '筹码守恒', 'facet.chipsBody': '筹码、轮内下注与底池之和始终是固定的 2,000。', 'facet.equity': '可见牌胜率', 'facet.equityBody': '以合法未知牌均匀随机为假设的确定性蒙特卡洛计算；它不会猜测对手范围。', 'facet.purpose': '战略目的',
    'facet.followSuit': '一墩结构', 'facet.followSuitBody': '手中还有首攻花色时，必须跟出该花色。', 'facet.structure': '牌型合法性', 'facet.guandanStructureBody': '本课只按点数比较单张。', 'facet.partnership': '搭档视角',
    'strategy.fold': '当代价超过这手牌可信的获胜路径时，放弃已经投入的成本。', 'strategy.check': '控制底池，并保留在获得更多信息后应对的选择。', 'strategy.call': '支付相同价格而不重开下注。先比较价格与计算胜率，再考虑后续轮次。', 'strategy.bet': '争取价值或弃牌率，同时为下一次决定定价。', 'strategy.raise': '增加压力和价格。问自己：哪些更差的牌会继续，哪些更好的牌会弃？',
    'strategy.bridgePartnership': '你的牌也是信息。保留进手张，并观察搭档以后能安全赢哪一墩。', 'strategy.guandanPartnership': '牌权属于全队。搭档已经控制牌权时，不出可以保留大牌。',
    'history.empty': '还没有牌局。', 'history.title': '牌局纪事', 'history.open': '打开', 'history.revision': '版本', 'history.promise': '本机保存 · 版本安全',
    'method.title': '如何让证据诚实', 'method.promise': '先标证据，再写解释', 'method.exact': '“精确”只来自确定规则：合法牌、筹码总数、赢墩者和结算。', 'method.calculated': '“计算”会标明抽样假设与样本数；它提供证据，但不掌管规则。', 'method.authored': '“教学原则”是可迁移的建议；有用不等于定理。',
    'event.handStarted': '发牌', 'event.smallBlind': '小盲', 'event.bigBlind': '大盲', 'event.folded': '弃牌', 'event.fold': '弃牌', 'event.check': '过牌', 'event.call': '跟注', 'event.bet': '下注', 'event.raise': '加注', 'event.flop': '发翻牌', 'event.turn': '发转牌', 'event.river': '发河牌', 'event.showdownWon': '摊牌获胜', 'event.foldWon': '无人争夺获胜', 'event.splitPot': '平分底池',
    'event.bridgeLessonStarted': '桥牌课发牌', 'event.guandanLessonStarted': '掼蛋课发牌', 'event.cardPlayed': '出牌', 'event.passed': '不要', 'event.trickWon': '赢得一墩', 'event.trickReset': '赢得牌权', 'event.bridgeLessonComplete': '桥牌课完成', 'event.guandanLessonComplete': '掼蛋课完成',
    'hand.highCard': '高牌', 'hand.pair': '一对', 'hand.twoPair': '两对', 'hand.trips': '三条', 'hand.straight': '顺子', 'hand.flush': '同花', 'hand.fullHouse': '葫芦', 'hand.quads': '四条', 'hand.straightFlush': '同花顺',
    'status.winner': '获胜者：{actor}', 'status.teamScore': '南北 {ns} · 东西 {ew}', 'status.finish': '出完顺序：{order}', 'status.saved': '已保存在本机', 'status.persistenceConflict': '另一项更新已先保存。已恢复最新牌桌，请重新选择。', 'status.persistenceFailed': '牌桌无法保存。本次操作没有提交，请重试。',
  },
  ja: {
    'app.title': 'オープンテーブル', 'app.subtitle': '形を見て、理由とともに選ぶ。', 'app.promise': '決定的 · 非公開 · 学べる', 'locale.label': '言語', 'nav.primary': 'メイン', 'nav.table': 'テーブル', 'nav.history': '対局記録', 'nav.method': '方法',
    'mode.holdem': 'テキサス・ホールデム', 'mode.bridge': 'コントラクトブリッジ', 'mode.guandan': 'グァンダン（掼蛋）',
    'mode.holdemDescription': 'ブラインド、4回のベッティング、オールイン、フォールド、ショーダウンを含む完全なヘッズアップ1ハンド。', 'mode.bridgeDescription': 'フォロー、切り札、パートナーとのタイミングを学ぶ、ビッドなし5トリック教材。', 'mode.guandanDescription': '主導権とパートナー意識を学ぶ、6枚・シングル限定の入門教材。',
    'limit.full': '完全な1ハンドルール', 'limit.bridgeMini': '入門テーブル · 5トリック · スペード固定切り札 · ビッド、ダミー、コントラクト得点は未収録。', 'limit.guandanMini': '入門テーブル · 1デッキ · シングル限定 · 貢ぎ、レベルワイルド、ボム、昇級得点は未収録。',
    'start.new': '新しい教材を配る', 'start.resume': 'テーブルを再開', 'start.seed': '再現シード', 'start.seedHelp': '同じシードは同じ非公開カードを再現します。プレイ中は秘密にしてください。',
    'table.you': 'あなた', 'table.villain': '相手', 'table.north': '北', 'table.east': '東', 'table.south': '南 · あなた', 'table.west': '西', 'table.right': '右の相手', 'table.partner': 'パートナー', 'table.left': '左の相手', 'table.hidden': '非公開カード',
    'table.pot': 'ポット', 'table.stack': 'スタック', 'table.community': '共有ボード', 'table.tricks': 'トリック', 'table.current': '現在のプレイ',
    'turn.yours': 'あなたの判断', 'turn.agent': '{actor} が判断中', 'turn.complete': '教材完了', 'decision.heading': '合法な意図', 'decision.preview': 'プレビュー · 状態は未変更', 'decision.choose': '意図を選び、変化を確かめましょう。', 'decision.confirm': 'このアクションを確定', 'decision.agentConfirm': 'エージェントの合法手を確定', 'decision.cancel': 'プレビュー解除',
    'action.fold': 'フォールド', 'action.check': 'チェック', 'action.call': 'コール', 'action.bet': 'ベット', 'action.allInBet': 'オールイン・ベット', 'action.raise': 'レイズ', 'action.allInRaise': 'オールイン・レイズ', 'action.playCard': 'このカードを出す', 'action.playSingle': 'シングルを出す', 'action.pass': 'パス',
    'evidence.exact': '正確なルール事実', 'evidence.calculated': '計算サンプル', 'evidence.authored': '著者による原則', 'facet.chips': 'チップ保存', 'facet.chipsBody': 'スタック、ストリート投入、ポットの合計は常に2,000です。', 'facet.equity': '可視カードのエクイティ', 'facet.equityBody': '未知の合法カードを一様と仮定する決定的モンテカルロ。相手レンジは推測しません。', 'facet.purpose': '戦略的目的',
    'facet.followSuit': 'トリック構造', 'facet.followSuitBody': 'リードされたスートを持つなら、必ずそのスートをフォローします。', 'facet.structure': 'パターン合法性', 'facet.guandanStructureBody': 'この教材はシングルをランクだけで比較します。', 'facet.partnership': 'パートナー視点',
    'strategy.fold': '価格が現実的な勝ち筋を上回るなら、既に払った分に執着せず降ります。', 'strategy.check': 'ポットを保ち、情報を得た後に応答する選択肢を残します。', 'strategy.call': '賭けを再開せず価格を合わせます。計算エクイティと価格を比べ、次のストリートも考えます。', 'strategy.bet': 'バリューまたはフォールドエクイティを取り、次の判断価格を定めます。', 'strategy.raise': '圧力と価格を上げます。弱い手のどれが続き、強い手のどれが降りるかを問います。', 'strategy.bridgePartnership': 'カードはメッセージでもあります。エントリーを残し、後でパートナーが安全に取れるトリックを見ます。', 'strategy.guandanPartnership': '主導権はチームのもの。パートナーが既に主導しているなら、パスで高い札を温存できます。',
    'history.empty': 'まだ教材はありません。', 'history.title': 'セッション記録', 'history.open': '開く', 'history.revision': 'リビジョン', 'history.promise': 'ローカル · リビジョン安全', 'method.title': '根拠を誠実に分ける方法', 'method.promise': '文章より先に根拠', 'method.exact': '「正確」は合法カード、チップ総数、トリック勝者、精算など決定的ルールだけです。', 'method.calculated': '「計算」はサンプル仮定と回数を示します。証拠であり、ルール権限ではありません。', 'method.authored': '「著者原則」は応用可能な助言です。有用でも定理とは装いません。',
    'event.handStarted': 'ハンド配布', 'event.smallBlind': 'スモールブラインド', 'event.bigBlind': 'ビッグブラインド', 'event.folded': 'フォールド', 'event.fold': 'フォールド', 'event.check': 'チェック', 'event.call': 'コール', 'event.bet': 'ベット', 'event.raise': 'レイズ', 'event.flop': 'フロップ', 'event.turn': 'ターン', 'event.river': 'リバー', 'event.showdownWon': 'ショーダウン勝利', 'event.foldWon': '無競争で勝利', 'event.splitPot': 'ポット分割', 'event.bridgeLessonStarted': 'ブリッジ教材配布', 'event.guandanLessonStarted': 'グァンダン教材配布', 'event.cardPlayed': 'カードをプレイ', 'event.passed': 'パス', 'event.trickWon': 'トリック獲得', 'event.trickReset': '主導権獲得', 'event.bridgeLessonComplete': 'ブリッジ教材完了', 'event.guandanLessonComplete': 'グァンダン教材完了',
    'hand.highCard': 'ハイカード', 'hand.pair': 'ワンペア', 'hand.twoPair': 'ツーペア', 'hand.trips': 'スリーカード', 'hand.straight': 'ストレート', 'hand.flush': 'フラッシュ', 'hand.fullHouse': 'フルハウス', 'hand.quads': 'フォーカード', 'hand.straightFlush': 'ストレートフラッシュ',
    'status.winner': '勝者：{actor}', 'status.teamScore': '南北 {ns} · 東西 {ew}', 'status.finish': '上がり順：{order}', 'status.saved': 'ローカル保存済み', 'status.persistenceConflict': '別の更新が先に保存されました。最新のテーブルを復元したので、もう一度選んでください。', 'status.persistenceFailed': 'テーブルを保存できませんでした。変更は確定されていません。もう一度お試しください。',
  },
}

export function translate(locale: Locale, key: string, values: Record<string, string | number> = {}): string {
  const template = catalogs[locale][key] ?? catalogs.en[key] ?? key
  return Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), template)
}
