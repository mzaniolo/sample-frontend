

export const SUBS_MEAS = `
  subscription{
  tagSubscribe(tag: "main"){
    name,
    timestamp,
    value
  }
}
`;

export const SUBS_ALM = `
subscription{
  almSubscribe{
    name,
    timestamp,
    value,
    state,
    severity,
    ack
  }
}
`;

export const GET_ALM = `
  query{
  alm{name,timestamp,value}
}
`;
