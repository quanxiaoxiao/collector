module.exports = ({
  building,
  gateway,
  type,
  sequence,
}) => `
<?xml version="1.0" encoding="UTF-8" ?>
<root>
  <common>
    <building_id>${building}</building_id>
    <gateway_id>${gateway}</gateway_id>
    <type>${type}_ack</type>
  </common>
  <sequence>${sequence}</sequence>
  <result>1</result>
</root>
`;

