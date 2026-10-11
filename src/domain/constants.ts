export const metaDefaults = {
  version: "1.0.0",
  apiVersion: "v1",
  features: {
    attachments: false,
    reminders: false,
    shareLinks: false,
    totp: false,
    registration: false,
    dcr: false,
  },
  limits: {
    titleMax: 60,
    narrativeMax: 20000,
    agentSummaryMax: 500,
    fearedOutcomeMax: 1000,
    thoughtsMax: 2000,
    bodySignalsMax: 500,
    immediateResponseMax: 1000,
    peopleMax: 10,
    personMax: 20,
    tagsMax: 10,
    tagMax: 20,
    emotionsMax: 5,
    noteMax: 5000,
    whatHappenedMax: 2000,
    perspectiveMax: 5000,
    trapsMax: 5,
    lessonIdsMax: 10,
    lessonTitleMax: 80,
    lessonBodyMax: 5000,
    reasonMax: 200,
    qMax: 100,
    pageMax: 100,
    listCap: 500,
    snoozeMaxDays: 90,
    keyLabelMax: 40,
    keyMaxDays: 365,
    passwordMin: 12,
    calendarMaxDays: 400,
  },
  review: {
    scheduleDays: [3, 14, 60],
    freezeHours: 24,
    trashDays: 30,
    snoozeMaxDays: 90,
  },
  enums: {
    scene: [
      {
        key: "work",
        label: "工作",
      },
      {
        key: "study",
        label: "学习",
      },
      {
        key: "social",
        label: "社交",
      },
      {
        key: "family",
        label: "家庭",
      },
      {
        key: "romance",
        label: "感情",
      },
      {
        key: "online",
        label: "网络",
      },
      {
        key: "public",
        label: "公共场合",
      },
      {
        key: "other",
        label: "其他",
      },
    ],
    emotion: [
      {
        key: "embarrassed",
        label: "尴尬",
      },
      {
        key: "ashamed",
        label: "丢脸",
      },
      {
        key: "anxious",
        label: "焦虑",
      },
      {
        key: "afraid",
        label: "害怕",
      },
      {
        key: "guilty",
        label: "内疚",
      },
      {
        key: "regretful",
        label: "后悔",
      },
      {
        key: "angry",
        label: "生气",
      },
      {
        key: "aggrieved",
        label: "委屈",
      },
      {
        key: "sad",
        label: "难过",
      },
      {
        key: "helpless",
        label: "无力",
      },
      {
        key: "other",
        label: "其他",
      },
    ],
    thinkingTrap: [
      {
        key: "spotlight",
        label: "聚光灯效应",
        hint: "以为所有人都在注意自己",
      },
      {
        key: "catastrophizing",
        label: "灾难化",
        hint: "直接想到最坏的结果",
      },
      {
        key: "mind_reading",
        label: "读心术",
        hint: "认定别人一定是这么看我的",
      },
      {
        key: "fortune_telling",
        label: "预言未来",
        hint: "认定坏结果一定会发生",
      },
      {
        key: "overgeneralizing",
        label: "以偏概全",
        hint: "一次出错就当成「我总是这样」",
      },
      {
        key: "personalizing",
        label: "个人化",
        hint: "把不全是自己的责任都揽到身上",
      },
      {
        key: "all_or_nothing",
        label: "非黑即白",
        hint: "不是完美就是彻底失败",
      },
      {
        key: "should",
        label: "应该思维",
        hint: "「我本应该……」式的苛责",
      },
    ],
    resolution: [
      {
        key: "let_go",
        label: "放下了",
      },
      {
        key: "easing",
        label: "好多了",
      },
      {
        key: "still_matters",
        label: "还在意",
      },
    ],
    fearCameTrue: [
      {
        key: "no",
        label: "没发生",
      },
      {
        key: "partly",
        label: "部分发生",
      },
      {
        key: "yes",
        label: "发生了",
      },
      {
        key: "unknown",
        label: "还不知道",
      },
    ],
    status: [
      {
        key: "fresh",
        label: "刚记下",
      },
      {
        key: "cooling",
        label: "冷却中",
      },
      {
        key: "due",
        label: "该回看",
      },
      {
        key: "reflected",
        label: "已回看",
      },
      {
        key: "settled",
        label: "已释怀",
      },
      {
        key: "archived",
        label: "已归档",
      },
    ],
    precision: [
      {
        key: "exact",
        label: "精确时间",
      },
      {
        key: "day",
        label: "只知道日期",
      },
      {
        key: "approx",
        label: "大概",
      },
    ],
    scope: [
      {
        key: "read",
        label: "读取历史",
      },
      {
        key: "write",
        label: "记录与补记",
      },
    ],
  },
} as const;
