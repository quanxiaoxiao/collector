module.exports = ({
  building,
  gateway,
}) => `
<?xml version="1.0" encoding="UTF-8" ?>
<root>
  <common>
    <building_id>${building}</building_id>
    <gateway_id>${gateway}</gateway_id>
    <type>request</type>
  </common>
  <id_validate operation="request"></id_validate>
</root>
`;
