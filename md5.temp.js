module.exports = ({
  building,
  gateway,
  md5,
}) => `
<?xml version="1.0" encoding="utf-8" ?>
<root>
  <common>
    <building_id>${building}</building_id>
    <gateway_id>${gateway}</gateway_id>
    <type>md5</type>
  </common>
  <id_validate operation="md5">
    <md5>${md5}</md5>
  </id_validate>
</root>
`;
