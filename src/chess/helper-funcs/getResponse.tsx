import OpenAI from "openai";

async function getResponse(inputString: string) {
    const openai = new OpenAI({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const prompt = `
You're going to create a custom chesspiece from an input string. The chesspiece should literally just be whatever the input string is; a concept, real person, object, etc. Write in plain text. The format of your response should look like the following (a JSON string):

{
"emoji": "<a singular emoji representing the piece. Only use ONE emoji.>"
"movement": <movement pattern; defined as an array of dictionaries. e.x. [{"x": 0, "y": 1}, {"x": 0, "y": 2}] <- this means the piece can move up either one, or two spaces. You need to include EACH individual move. As an example, if a piece can move in a straight vertical line, you need to include each individual y value (-7 to 7)>
"attack": <attack pattern; defined the same as the movement but represents how a piece can attack>
"traits": <traits; an array of strings representing different abilities of the piece. e.x. [] (no traits), ["STATIONARY_ATTACK"] (one trait), ["STATIONARY_ATTACK", "IGNORE_BLOCKED_ATTACK"] (many traits). Included is a list of traits to choose from. You can select 1, many, or no traits>
}

list of traits:
- STATIONARY_ATTACK -> the piece doesnt move to the attacked piece. Can be used for pieces that shoot projectiles.
- IGNORE_BLOCKED_ATTACK -> the piece doesn't need line of sight to attack (e.g. the knight, or any piece with high mobility)
- IGNORE_BLOCKED_MOVE -> the piece doesn't need line of sight to move (e.g. the knight, or any piece with high mobility)
- SELF_DESTRUCT -> when attacking another piece, this piece is also destroyed (e.g. for one use pieces like bombs, and self sacrificing units)
- REFLECT -> when this piece is attacked, the attacker is also destroyed (e.g. for defensive pieces with retalitory damage like traps)
- RADIUS -> the piece can attack in a radius around itself. Can destroy pieces of its own colour. (e.g. a bomb that explodes in a 3x3 area)
- MULTIATTACK -> the piece automatically attacks all pieces in valid attack positions. Does not attack pieces of its own colour. (e.g a unit that can attack multiple times, or really quickly)
- STATUS_EFFECT -> the piece applies a status effect to the attacked piece, instead of destroying it. Uses the piece's attack pattern. (e.g. a piece that freezes the attacked piece). In order to apply a status effect to another piece, it MUST be able to attack, as it uses the attack positions to apply the status effect. Template for status effect: { "status": ["IMMOBILE", "WEAKENED"], "name": "Stuck in tar", emoji: "💩", "duration": 1 } (status is the status effect, duration is how many turns the status effect lasts. The name is a custom name you call the status effect, and the emoji is a custom representation of the status effect.)
    > list of status effects: [
    - IMMOBILE -> the piece cannot move or attack
    - SHIELDED -> the piece can take one hit without being destroyed. This status effect is removed after being hit once.
    - GOADED -> the piece can only attack, not move
    - WEAKENED -> the piece can only move, not attack
    - HASTED -> the piece can move twice in one turn
    - CLEAR -> removes all status effects from the piece
    ]
- TARGET_ALLY -> the piece can target its own pieces. (e.g. a healer, or a piece that can buff other pieces)
- SUMMONER -> the piece can summon other pieces, instead of attacking. It summons the piece using its attack pattern. (e.g. a piece that can spawn pawns, or a piece that can spawn a bomb). You MUST include the name of the summoned piece.
    
sample pieces for reference:
- Knight:
{
    "emoji": "♞",
    "movement": [{ "x": 1, "y": 2 }, { "x": -1, "y": 2 }, { "x": 1, "y": -2 }, { "x": -1, "y": -2 }, { "x": 2, "y": 1 }, { "x": -2, "y": 1 }, { "x": 2, "y": -1 }, { "x": -2, "y": -1 }],
    "attack": [{ "x": 1, "y": 2 }, { "x": -1, "y": 2 }, { "x": 1, "y": -2 }, { "x": -1, "y": -2 }, { "x": 2, "y": 1 }, { "x": -2, "y": 1 }, { "x": 2, "y": -1 }, { "x": -2, "y": -1 }],
    "traits": ["IGNORE_BLOCKED_ATTACK", "IGNORE_BLOCKED_MOVE"]
}

- Rook:
{
    "emoji": "♜",
    "movement": [{ x: 0, y: 1 }, { x: 0, y: -1 }, {x: 0, y: 2}, {x: 0, y: -2}, {x: 0, y: 3}, {x: 0, y: -3}, {x: 0, y: 4}, {x: 0, y: -4}, {x: 0, y: 5}, {x: 0, y: -5}, {x: 0, y: 6}, {x: 0, y: -6}, {x: 0, y: 7}, {x: 0, y: -7},
                {x: 1, y: 0}, {x: -1, y: 0}, {x: 2, y: 0}, {x: -2, y: 0}, {x: 3, y: 0}, {x: -3, y: 0}, {x: 4, y: 0}, {x: -4, y: 0}, {x: 5, y: 0}, {x: -5, y: 0}, {x: 6, y: 0}, {x: -6, y: 0}, {x: 7, y: 0}, {x: -7, y: 0}],
    "attack": [{ x: 0, y: 1 }, { x: 0, y: -1 }, {x: 0, y: 2}, {x: 0, y: -2}, {x: 0, y: 3}, {x: 0, y: -3}, {x: 0, y: 4}, {x: 0, y: -4}, {x: 0, y: 5}, {x: 0, y: -5}, {x: 0, y: 6}, {x: 0, y: -6}, {x: 0, y: 7}, {x: 0, y: -7},
                {x: 1, y: 0}, {x: -1, y: 0}, {x: 2, y: 0}, {x: -2, y: 0}, {x: 3, y: 0}, {x: -3, y: 0}, {x: 4, y: 0}, {x: -4, y: 0}, {x: 5, y: 0}, {x: -5, y: 0}, {x: 6, y: 0}, {x: -6, y: 0}, {x: 7, y: 0}, {x: -7, y: 0}],
    "traits": []
}

- Mine:
{
    "emoji": "💣",
    "movement": [],
    "attack": [],
    "traits": ["REFLECT"]
}

- Sniper:
{
    "emoji": "🎯",
    "movement": [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }],
    "attack": [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 }, { x: 0, y: 7 }],
    "traits": ["STATIONARY_ATTACK"],
}

- Freeze Ray:
{
    "emoji": "❄️",
    "movement": [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }],
    "attack": [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }], 
    "traits": ["STATUS_EFFECT"],
    "statusEffect": { "status": ["IMMOBILE"], "name": "Frozen", "emoji": "❄️", "duration": 1 }
}

- Large Forcefield:
{
    "emoji": "🛡️",
    "movement": [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }],
    "attack": [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }], 
    "traits": ["STATUS_EFFECT", "TARGET_ALLY", "RADIUS"],
    "statusEffect": { "status": ["SHIELDED"], "name": "Shielded", "emoji": "🛡️", "duration": 1 }
}

- Splash Potion of Swiftness:
{
    "emoji": "🧪",
    "movement": [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }],
    "attack": [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }],
    "traits": ["STATUS_EFFECT", "TARGET_ALLY", "SELF_DESTRUCT", "RADIUS"],
    "statusEffect": { "status": ["HASTED"], "name": "Hasted", "emoji": "⚡", "duration": 1 }
}

- Necromancer:
{
    "emoji": "🧟",
    "movement": [],
    "attack": [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }],
    "traits": ["SUMMONER"],
    "summonedPiece": "Skeleton"
}

Be very creative with your pieces! Don't worry about trying to make the pieces balanced; an ant would be super weak and a thermonuclear bomb would be super strong. Pieces can be literally completely useless, or the most overpowered and broken piece in existance. The movement and attacks don't always need to be symmetrical; they can have fun and unique patterns. Not all pieces need to have traits. The movement, attacks, and traits should all deeply reflect the input string.
        `;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: prompt
            },
            {
                role: "user",
                content: "Your input string is: " + inputString
            }
        ],
        temperature: 0.9,
    })

    console.log(response);
    return response.choices[0].message.content;
}

export default getResponse;
