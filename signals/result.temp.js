const moment = require('moment');

module.exports = ({
  building,
  gateway,
  success,
}) => `
<?xml version="1.0" encoding="utf-8" ?>
<root>
  <common>
    <building_id>${building}</building_id>
    <gateway_id>${gateway}</gateway_id>
    <type>result</type>
    <type>time</type>
  </common>
  <id_validate operation="result">
    <result>${success ? 'pass' : 'fail'}</result>
    <time>${moment().format('YYYYMMDDHHmmss')}</time>
  </id_validate>
</root>
`;
