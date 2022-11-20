interface iTuple {
  Offset: number;
  Type: number;
}

export function intersection(
  s: iTuple[]
): [lower: number, upper: number, ok: boolean] {
  let M = s.length / 3;
  let F = 0;
  let lower = 0;
  let upper = 0;

L:
  while (F < M / 2) {
    let End = 0;
    let Mid = 0;

    for (let i = 0; i < s.length; i++) {
      End = End - s[i].Type;
      if (End >= M - F) {
        lower = s[i].Offset;
        break;
      }

      if (s[i].Type === 0) {
        Mid = Mid + 1;
      }

      if (i === s.length - 1) {
        F = F + 1;
        if (F >= M / 2) {
          break L;
        }
        continue L;
      }
    }

    End = 0;

    for (let i = s.length - 1; i >= 0; i--) {
      End = End + s[i].Type;
      if (End >= M - F) {
        upper = s[i].Offset;
        break;
      }

      if (s[i].Type === 0) {
        Mid = Mid + 1;
      }

      if (i === 0) {
        F = F + 1;
        if (F >= M / 2) {
          break L;
        }
        continue L;
      }
    }

    if (lower <= upper && Mid <= F) {
      return [lower, upper, true];
    }

    F = F + 1;
    if (F >= M / 2) {
      break;
    }
  }

  return [0, 0, false];
}

export async function read(
  url: string
): Promise<[offset: number, error: number]> {
  const t0 = new Date().getTime();
  const response = await fetch(url);
  const t3 = new Date().getTime();
  let t1 = t0;
  let t2 = t3;

  if (response.status !== 200) {
    throw new Error("HTTP Error: " + response.status);
  }

  const data = await response.text();
  const tt = data.split("$");
  if (tt.length < 2) {
    throw new Error("Invalid data");
  }
  t1 = Number(BigInt(tt[0]) / BigInt(1000)) / 1000;
  t2 = Number(BigInt(tt[1]) / BigInt(1000)) / 1000;

  const offset = (t1 - t0 + t2 - t3) / 2;
  const error = Math.abs(t3 - t0 - (t2 - t1)) / 2;

  return [offset, error];
}

export async function sync(
  urls: string[],
  samples: number,
) : Promise<[lower: number, upper: number, ok: boolean]> {
  const s: iTuple[] = [];

  for (let i = 0; i < urls.length; i++) {
    for (let j = 0; j < samples; j++) {
      const [offset, error] = await read(urls[i]);
      s.push({ Offset: offset, Type: 0 });
      s.push({ Offset: offset + error, Type: 1 });
      s.push({ Offset: offset - error, Type: -1 });
    }
  }

  s.sort((a, b) => a.Offset - b.Offset);

  return intersection(s);
}
