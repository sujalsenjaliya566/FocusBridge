import type { AnalogyProfile, CognitiveAnalysis } from "@/types";

// ─── Analogy Profiles ─────────────────────────────────────────────────────────

export const ANALOGY_PROFILES: AnalogyProfile[] = [
  {
    id: "automation",
    name: "Systems & Automation",
    category: "Engineering",
    promptAnchor:
      "Factorio factory automation — conveyor belts, inserter arms, splitter logic, assembler queues, and circuit network conditions",
  },
  {
    id: "culinary",
    name: "Culinary Chemistry",
    category: "Kitchen Science",
    promptAnchor:
      "Professional cooking — emulsification, reduction sauces, Maillard reactions, mise-en-place organisation, and heat transfer dynamics",
  },
  {
    id: "audio",
    name: "Audio Engineering",
    category: "Music Production",
    promptAnchor:
      "Audio signal flow — gain staging, sidechain compression, frequency crossovers, reverb pre-delay, and summing bus routing",
  },
  {
    id: "rts",
    name: "RTS & Game Economy",
    category: "Strategy Games",
    promptAnchor:
      "Real-time strategy games — resource pools, worker micro-cycles, supply caps, tech tree gating, and army composition counters",
  },
];

// ─── Initial Academic Passage: Raft Consensus Protocol ───────────────────────

export const INITIAL_DOCUMENT_TITLE = "Raft: A Consensus Algorithm for Replicated State Machines";

export const INITIAL_ACADEMIC_PASSAGE = `The Raft consensus algorithm was designed as an understandable alternative to Paxos for managing a replicated log in distributed systems. Raft decomposes consensus into three relatively independent subproblems: leader election, log replication, and safety — ensuring that at all times, at most one leader can be elected in any given term.

Leader Election operates through a randomised timeout mechanism. Each server begins in the follower state, expecting periodic heartbeat messages (AppendEntries RPCs with empty payloads) from a legitimate leader. If a follower receives no communication within its election timeout window — a value chosen randomly between 150 ms and 300 ms — it transitions to the candidate state, increments its current term, votes for itself, and issues RequestVote RPCs to all other cluster members in parallel. A candidate wins the election if it accumulates votes from a strict majority of the cluster. Because each server grants at most one vote per term on a first-come, first-served basis, at most one candidate can win a given election, preventing split-brain scenarios.

Log Replication begins immediately after a leader is elected. When a client submits a command, the leader appends the entry to its own log and then replicates it to follower nodes via AppendEntries RPCs issued concurrently. The leader marks the entry as committed once it has been stored on a majority of servers. The committed index is piggybacked onto subsequent AppendEntries messages, instructing followers to apply the entry to their state machines. Raft enforces a Log Matching Property: if two entries in different logs share the same index and term, then the logs are guaranteed to be identical in all entries up through that index.

Safety is maintained through the Leader Completeness Property: a leader must always contain all log entries that have been committed in any previous term. This invariant is enforced during RequestVote RPCs — a server refuses to vote for a candidate whose log is less up-to-date than its own. Log currency is compared by inspecting the term and then the index of the last entry; whichever log has the higher last-entry term is considered more up-to-date, with log length used as a tiebreaker.

Cluster membership changes are handled through joint consensus, a two-phase approach in which the cluster first transitions to a joint configuration containing both old and new server sets before committing the final new configuration. This ensures there is never a moment during reconfiguration when two independent majorities could elect separate leaders — a critical property for maintaining linearisability of the replicated state machine across dynamic topology changes.`;

// ─── Pre-computed Analysis (displayed on initial mount) ──────────────────────

export const PRECOMPUTED_ANALYSIS: CognitiveAnalysis = {
  coreTakeaway:
    "Raft achieves fault-tolerant consensus by electing a single authoritative leader per term who serialises all writes and replicates them to a majority of followers before marking them committed.",

  mechanics: [
    {
      phase: "Follower Timeout",
      explanation:
        "Every server starts as a follower, waiting for heartbeats. A randomised election timeout (150–300 ms) ensures servers don't all call elections simultaneously — the first to time out wins the race to candidacy.",
    },
    {
      phase: "Candidate RequestVote",
      explanation:
        "A timed-out follower increments its term, votes for itself, and sends RequestVote RPCs to peers. Each peer grants at most one vote per term, guaranteeing that only a single majority winner can emerge.",
    },
    {
      phase: "Leader Heartbeats",
      explanation:
        "The elected leader immediately broadcasts empty AppendEntries RPCs to reset follower timers and assert its authority, suppressing new elections for as long as it remains healthy.",
    },
    {
      phase: "Log Replication",
      explanation:
        "Client commands are appended to the leader's log, then replicated to all followers in parallel via AppendEntries RPCs. An entry becomes committed — and applied to state machines — once it is stored on a strict majority.",
    },
    {
      phase: "Safety Enforcement",
      explanation:
        "A candidate is rejected if its log is less up-to-date than the voter's. This Leader Completeness Property ensures a new leader always holds every previously committed entry, preventing data loss across term transitions.",
    },
  ],

  analogy:
    "Think of the Raft leader as the sole main bus in a Factorio factory: every raw material (client command) must flow onto this central belt before being distributed to all assembler machines (followers). The election timeout is like a circuit-breaker sensor — if the belt stops moving for too long, the backup inserter arm (candidate) kicks in, increments a counter on its own circuit network, and races to re-establish flow before any other arm can. A command only leaves the 'pending' chest and enters the 'committed' production line once the majority splitter confirms that more than half the assemblers have buffered their copy — ensuring the factory never builds on a recipe that hasn't been properly stocked.",

  checkpoint: {
    question:
      "A follower's election timeout fires. According to Raft, what does it do FIRST before sending any RequestVote RPCs?",
    options: [
      "It immediately broadcasts an AppendEntries RPC to reset other timers.",
      "It increments its current term and votes for itself.",
      "It sends a heartbeat to the existing leader to verify it is still alive.",
      "It waits for a second timeout cycle to confirm the leader is truly down.",
    ],
    correctIndex: 1,
    explanation:
      "A follower that times out transitions to candidate state, increments its current term (establishing a new logical epoch), and casts a self-vote — both of which happen before any RequestVote RPC is dispatched to peers. This ordering is critical: the term increment ensures votes received in previous terms are not double-counted.",
  },
};
