

export const SUBS_MEAS = `
subscription{
  tagSubscribe(equipmentRegex: "sample_substation.*", tags: ["main"]) {
        name
        equipment
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
