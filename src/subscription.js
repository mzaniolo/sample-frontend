

export const SUBS_MEAS = `
subscription{
  tagSubscribe(equipment: ["eqp"], tags: ["main"]) {
        name
        timestamp
        type
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

export const ALM_ACK = `
mutation AlmAck($almName: String!) {
    almAck(almName: $almName)
}`;
