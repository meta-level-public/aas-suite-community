using System.IO.Packaging;
using BaSyx.Models.Export;
using LiquidTechnologies.XmlObjects;

namespace AasDesignerApi.Import.AasxParser
{
    public class V3AasxXmlParser : IAasxParser
    {
        public object GetAasxObject(Package package, out List<string> errorMessages)
        {
            errorMessages = new List<string>();

            using Stream file = AasxParserHelper
                .GetSpecPart(package)
                .GetStream(FileMode.Open, FileAccess.Read);
            var aasxInputXml = new StreamReader(file).ReadToEnd();

            LxSerializer<AasSchema.Tns.EnvironmentElm> serializer =
                new LxSerializer<AasSchema.Tns.EnvironmentElm>();

            using (TextReader textReader = new StringReader(aasxInputXml))
            {
                LxReaderSettings readerSettings = new LxReaderSettings
                {
                    ErrorHandler = XmlReader_ErrorHandler,
                };

                AasSchema.Tns.EnvironmentElm environmentElm = serializer.Deserialize(
                    textReader,
                    readerSettings
                );

                return environmentElm;
            }
        }

        private void XmlReader_ErrorHandler(
            string msg,
            LxErrorSeverity severity,
            LxErrorCode errorCode,
            TextLocation? location,
            object targetObject
        )
        {
            Console.WriteLine($"{severity}:{errorCode}:{location} {msg}");

            if (severity == LxErrorSeverity.Error)
                throw new LxSerializationException(
                    msg,
                    severity,
                    errorCode,
                    location,
                    targetObject
                );
        }
    }
}
