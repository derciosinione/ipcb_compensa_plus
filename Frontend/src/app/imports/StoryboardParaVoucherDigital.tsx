import svgPaths from "./svg-4xt3nbbfhd";
import clsx from "clsx";

function CardContent1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[933px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start pb-0 pt-[16px] px-[16px] relative size-full">{children}</div>
    </div>
  );
}

function Container8({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[16px] relative shrink-0 w-[88px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[2px] items-start relative size-full">{children}</div>
    </div>
  );
}
type Container7Props = {
  additionalClassNames?: string;
};

function Container7({ children, additionalClassNames = "" }: React.PropsWithChildren<Container7Props>) {
  return (
    <div className={clsx("h-[44px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">{children}</div>
    </div>
  );
}
type CardProps = {
  additionalClassNames?: string;
};

function Card({ children, additionalClassNames = "" }: React.PropsWithChildren<CardProps>) {
  return (
    <div className={clsx("absolute bg-white h-[195px] left-0 w-[937px]", additionalClassNames)}>
      <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip p-[2px] relative rounded-[inherit] size-full">{children}</div>
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function CardContent({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[668px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start px-[24px] py-0 relative size-full">{children}</div>
    </div>
  );
}

function Container6({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[1016px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pt-[32px] px-[32px] relative rounded-[inherit] size-full">{children}</div>
    </div>
  );
}

function Container5({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[64px] relative shrink-0 w-[1016px]">
      <div aria-hidden="true" className="absolute border-[0px_0px_2px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[2px] pt-0 px-[32px] relative size-full">{children}</div>
    </div>
  );
}

function Container4({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[20px] relative shrink-0 w-[224.453px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-start relative size-full">{children}</div>
    </div>
  );
}

function Container3({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute bg-white h-[768px] left-0 top-[102px] w-[1024px]">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[4px] relative rounded-[inherit] size-full">{children}</div>
      <div aria-hidden="true" className="absolute border-4 border-black border-solid inset-0 pointer-events-none" />
    </div>
  );
}
type CardHeaderProps = {
  additionalClassNames?: string;
};

function CardHeader({ children, additionalClassNames = "" }: React.PropsWithChildren<CardHeaderProps>) {
  return (
    <div className={clsx("bg-white h-[74px] relative shrink-0", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid gap-[6px] grid grid-cols-[repeat(1,_minmax(0px,_1fr))] grid-rows-[minmax(0px,_16fr)_minmax(0px,_1fr)] pb-[2px] pt-[26px] px-[26px] relative size-full">{children}</div>
    </div>
  );
}
type Wrapper10Props = {
  additionalClassNames?: string;
};

function Wrapper10({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper10Props>) {
  return (
    <div className={clsx("absolute size-[12px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        {children}
      </svg>
    </div>
  );
}
type Wrapper9Props = {
  additionalClassNames?: string;
};

function Wrapper9({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper9Props>) {
  return (
    <div className={clsx("h-[22px] relative shrink-0 w-[82.813px]", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[9px] py-[3px] relative rounded-[inherit] size-full">{children}</div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none" />
    </div>
  );
}
type Wrapper8Props = {
  additionalClassNames?: string;
};

function Wrapper8({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper8Props>) {
  return (
    <div className={additionalClassNames}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type Wrapper5Props = {
  additionalClassNames?: string;
};

function Wrapper5({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper5Props>) {
  return <Wrapper8 additionalClassNames={clsx("relative shrink-0", additionalClassNames)}>{children}</Wrapper8>;
}
type Wrapper7Props = {
  additionalClassNames?: string;
};

function Wrapper7({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper7Props>) {
  return <Wrapper8 additionalClassNames={clsx("basis-0 grow min-h-px min-w-px relative shrink-0", additionalClassNames)}>{children}</Wrapper8>;
}
type Wrapper6Props = {
  additionalClassNames?: string;
};

function Wrapper6({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper6Props>) {
  return <Wrapper8 additionalClassNames={clsx("h-[24px] relative shrink-0", additionalClassNames)}>{children}</Wrapper8>;
}
type Wrapper4Props = {
  additionalClassNames?: string;
};

function Wrapper4({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper4Props>) {
  return <Wrapper8 additionalClassNames={clsx("h-[20px] relative shrink-0", additionalClassNames)}>{children}</Wrapper8>;
}
type Wrapper3Props = {
  additionalClassNames?: string;
};

function Wrapper3({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper3Props>) {
  return (
    <div className={clsx("size-[16px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        {children}
      </svg>
    </div>
  );
}
type Wrapper2Props = {
  text: string;
};

function Wrapper2({ children, text }: React.PropsWithChildren<Wrapper2Props>) {
  return (
    <div className="basis-0 bg-white grow h-[36px] min-h-px min-w-px relative shrink-0">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Courier_New:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap">{text}</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
    </div>
  );
}
type Icon3Props = {
  additionalClassNames?: string;
};

function Icon3({ children, additionalClassNames = "" }: React.PropsWithChildren<Icon3Props>) {
  return (
    <div className={clsx("absolute left-0 size-[20px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">{children}</g>
      </svg>
    </div>
  );
}

function Wrapper1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-white h-[36px] relative shrink-0 w-full">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">{children}</div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
    </div>
  );
}
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <Wrapper3 additionalClassNames={additionalClassNames}>
      <g id="Icon">{children}</g>
    </Wrapper3>
  );
}

function Icon2({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 grow h-[16px] min-h-px min-w-px relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute inset-[8.33%_8.33%_12.2%_8.33%]" data-name="Vector">
          <div className="absolute inset-[-5.24%_-5%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6679 14.048">
              {children}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <Wrapper additionalClassNames="relative shrink-0">
      <path d={svgPaths.pb3a1300} fill="var(--fill-0, #FDC700)" id="Vector" stroke="var(--stroke-0, #FDC700)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Wrapper>
  );
}
type TextText7Props = {
  text: string;
};

function TextText7({ text }: TextText7Props) {
  return (
    <Wrapper4 additionalClassNames="w-[67.453px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#0a0a0a] text-[14px] top-px w-[68px]">{text}</p>
    </Wrapper4>
  );
}

function Icon() {
  return (
    <Wrapper additionalClassNames="relative shrink-0">
      <path d={svgPaths.p14548f00} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d={svgPaths.p17781bc0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Wrapper>
  );
}
type BadgeTextProps = {
  text: string;
};

function BadgeText({ text }: BadgeTextProps) {
  return (
    <Wrapper9 additionalClassNames="bg-[#eceef2]">
      <p className="font-['Courier_New:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">{text}</p>
    </Wrapper9>
  );
}
type TextText6Props = {
  text: string;
  additionalClassNames?: string;
};

function TextText6({ text, additionalClassNames = "" }: TextText6Props) {
  return (
    <Wrapper8 additionalClassNames={clsx("h-[16px] relative shrink-0", additionalClassNames)}>
      <Wrapper10 additionalClassNames="left-0 top-[2px]">
        <g clipPath="url(#clip0_109_1846)" id="Icon">
          <path d="M6 3V6L8 7" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p3e7757b0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_109_1846">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </Wrapper10>
      <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[16px] left-[16px] not-italic text-[#99a1af] text-[12px] text-nowrap top-0">{text}</p>
    </Wrapper8>
  );
}
type TextText5Props = {
  text: string;
};

function TextText5({ text }: TextText5Props) {
  return (
    <Wrapper4 additionalClassNames="w-[58.813px]">
      <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[20px] left-[29.5px] not-italic text-[#6a7282] text-[14px] text-center text-nowrap top-0 translate-x-[-50%]">{text}</p>
    </Wrapper4>
  );
}
type TextText4Props = {
  text: string;
  additionalClassNames?: string;
};

function TextText4({ text, additionalClassNames = "" }: TextText4Props) {
  return (
    <div className={clsx("absolute content-stretch flex h-[16px] items-start top-[2px]", additionalClassNames)}>
      <p className="font-['Courier_New:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-nowrap">{text}</p>
    </div>
  );
}
type TextText3Props = {
  text: string;
  additionalClassNames?: string;
};

function TextText3({ text, additionalClassNames = "" }: TextText3Props) {
  return (
    <div className={clsx("absolute content-stretch flex h-[16px] items-start left-0 top-[2px]", additionalClassNames)}>
      <p className="font-['Courier_New:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#6a7282] text-[14px] text-nowrap">{text}</p>
    </div>
  );
}
type ButtonTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ButtonText({ text, additionalClassNames = "" }: ButtonTextProps) {
  return (
    <div className={clsx("bg-white h-[36px] relative shrink-0", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[18px] py-[10px] relative size-full">
        <p className="font-['Courier_New:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-black text-center text-nowrap uppercase">{text}</p>
      </div>
    </div>
  );
}
type Text3Props = {
  text: string;
};

function Text3({ text }: Text3Props) {
  return (
    <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
      <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[20px] left-0 not-italic text-[#0a0a0a] text-[14px] text-nowrap top-0">{text}</p>
    </div>
  );
}
type TextText2Props = {
  text: string;
};

function TextText2({ text }: TextText2Props) {
  return (
    <div className="h-[20px] opacity-70 relative shrink-0 w-[58.813px]">
      <Text3 text={text} />
    </div>
  );
}
type Container2Props = {
  additionalClassNames?: string;
};

function Container2({ additionalClassNames = "" }: Container2Props) {
  return (
    <div className="h-[32px] relative shrink-0 w-[158.828px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Container additionalClassNames="bg-white" />
        <TextText1 text="VoucherPool" additionalClassNames="h-[28px]" />
      </div>
    </div>
  );
}
type TextText1Props = {
  text: string;
  additionalClassNames?: string;
};

function TextText1({ text, additionalClassNames = "" }: TextText1Props) {
  return (
    <Wrapper8 additionalClassNames={clsx("basis-0 grow min-h-px min-w-px relative shrink-0", additionalClassNames)}>
      <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[28px] left-0 not-italic text-[#0a0a0a] text-[18px] text-nowrap top-0">{text}</p>
    </Wrapper8>
  );
}
type Text2Props = {
  text: string;
  additionalClassNames?: string;
};

function Text2({ text, additionalClassNames = "" }: Text2Props) {
  return (
    <div className={additionalClassNames}>
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
      <p className="font-['Courier_New:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-black text-center text-nowrap uppercase">{text}</p>
    </div>
  );
}
type Text1Props = {
  text: string;
  additionalClassNames?: string;
};

function Text1({ text, additionalClassNames = "" }: Text1Props) {
  return <Text2 text={text} additionalClassNames={clsx("absolute bg-[#eee] content-stretch flex h-[36px] items-center justify-center px-[18px] py-[10px]", additionalClassNames)} />;
}
type TextProps = {
  text: string;
  additionalClassNames?: string;
};

function Text({ text, additionalClassNames = "" }: TextProps) {
  return <Text2 text={text} additionalClassNames={clsx("absolute bg-white content-stretch flex h-[31px] items-center justify-center px-[10px] py-[6px] top-[3.5px]", additionalClassNames)} />;
}
type InputTextProps = {
  text: string;
};

function InputText({ text }: InputTextProps) {
  return (
    <Wrapper1>
      <p className="font-['Courier_New:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap">{text}</p>
    </Wrapper1>
  );
}
type PrimitiveLabelTextProps = {
  text: string;
};

function PrimitiveLabelText({ text }: PrimitiveLabelTextProps) {
  return (
    <div className="content-stretch flex h-[14px] items-center relative shrink-0 w-full">
      <p className="font-['Courier_New:Regular',sans-serif] leading-[14px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-nowrap">{text}</p>
    </div>
  );
}
type CardDescriptionTextProps = {
  text: string;
};

function CardDescriptionText({ text }: CardDescriptionTextProps) {
  return (
    <div className="[grid-area:2_/_1] place-self-stretch relative shrink-0">
      <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#717182] text-[16px] text-nowrap top-0">{text}</p>
    </div>
  );
}
type CardTitleTextProps = {
  text: string;
};

function CardTitleText({ text }: CardTitleTextProps) {
  return (
    <div className="[grid-area:1_/_1] place-self-stretch relative shrink-0">
      <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#0a0a0a] text-[16px] text-nowrap top-0">{text}</p>
    </div>
  );
}
type Icon2VectorProps = {
  additionalClassNames?: string;
};

function Icon2Vector({ additionalClassNames = "" }: Icon2VectorProps) {
  return (
    <div className={clsx("absolute", additionalClassNames)}>
      <div className="absolute inset-[-25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <path d={svgPaths.p168a3a80} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
        </svg>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-white h-[40px] relative shrink-0 w-[1016px]">
      <div aria-hidden="true" className="absolute border-[0px_0px_2px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center pb-[2px] pt-0 px-[16px] relative size-full">
        <div className="h-[12px] relative shrink-0 w-[52px]">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-start relative size-full">
            {[...Array(2).keys()].map((_, i) => (
              <div className="relative shrink-0 size-[12px]">
                <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none" />
              </div>
            ))}
            <div className="basis-0 grow h-[12px] min-h-px min-w-px relative shrink-0">
              <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="basis-0 grow h-[24px] min-h-px min-w-px relative shrink-0">
          <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none" />
          <div className="flex flex-row items-center size-full">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[9px] py-px relative size-full">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#99a1af] text-[12px] text-nowrap">{"https://voucherpool.app/dashboard"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
type ContainerProps = {
  additionalClassNames?: string;
};

function Container({ additionalClassNames = "" }: ContainerProps) {
  return (
    <div className={clsx("relative shrink-0 size-[32px]", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none" />
    </div>
  );
}
type ParagraphTextProps = {
  text: string;
};

function ParagraphText({ text }: ParagraphTextProps) {
  return (
    <div className="h-[20px] relative shrink-0 w-full">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-black text-nowrap top-px">{text}</p>
    </div>
  );
}
type HeadingText1Props = {
  text: string;
};

function HeadingText1({ text }: HeadingText1Props) {
  return (
    <div className="h-[28px] relative shrink-0 w-full">
      <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[28px] left-0 not-italic text-[18px] text-black text-nowrap top-0">{text}</p>
    </div>
  );
}
type HeadingTextProps = {
  text: string;
  additionalClassNames?: string;
};

function HeadingText({ text, additionalClassNames = "" }: HeadingTextProps) {
  return (
    <Wrapper8 additionalClassNames={clsx("h-[32px] relative shrink-0", additionalClassNames)}>
      <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[32px] left-0 not-italic text-[24px] text-black text-nowrap top-0">{text}</p>
    </Wrapper8>
  );
}
type TextTextProps = {
  text: string;
  additionalClassNames?: string;
};

function TextText({ text, additionalClassNames = "" }: TextTextProps) {
  return (
    <div className={clsx("bg-white h-[32px] relative shrink-0", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[20px] left-[18px] not-italic text-[14px] text-black text-nowrap top-[6px] tracking-[0.35px] uppercase">{text}</p>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="h-[870px] relative shrink-0 w-[48px]" data-name="Arrow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <div className="relative shrink-0 size-[48px]" data-name="Icon">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
            <g id="Icon">
              <path d="M10 24H38" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path d="M24 10L38 24L24 38" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function StoryboardParaVoucherDigital() {
  return (
    <div className="bg-white relative size-full" data-name="Storyboard para Voucher Digital">
      <div className="absolute bg-white content-stretch flex flex-col h-[2190px] items-start left-0 overflow-clip pb-0 pt-[32px] px-[32px] top-0 w-[1536px]" data-name="StoryboardView">
        <div className="content-stretch flex flex-col gap-[48px] h-[2111px] items-start relative shrink-0 w-full" data-name="Container">
          <div className="content-stretch flex h-[84px] items-start justify-between relative shrink-0 w-full" data-name="Container">
            <div className="h-[84px] relative shrink-0 w-[497.469px]" data-name="Container">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative size-full">
                <div className="h-[40px] relative shrink-0 w-full" data-name="Heading 1">
                  <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[40px] left-0 not-italic text-[36px] text-black text-nowrap top-0 tracking-[0.3691px]">WIREFRAME DESKTOP</p>
                </div>
                <div className="h-[28px] relative shrink-0 w-full" data-name="Paragraph">
                  <p className="absolute font-['Inter:Italic',sans-serif] font-normal italic leading-[28px] left-0 text-[20px] text-black text-nowrap top-0 tracking-[-0.4492px]">Estrutura visual simplificada para validação de fluxo web.</p>
                </div>
              </div>
            </div>
            <div className="bg-white h-[44.391px] relative rounded-[10px] shrink-0 w-[223.938px]" data-name="Container">
              <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[13px] py-px relative size-full">
                <Wrapper3 additionalClassNames="relative shrink-0">
                  <g clipPath="url(#clip0_109_1901)" id="Icon">
                    <path d={svgPaths.p24613e80} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p3dd52f00} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p2d792300} id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </g>
                  <defs>
                    <clipPath id="clip0_109_1901">
                      <rect fill="white" height="16" width="16" />
                    </clipPath>
                  </defs>
                </Wrapper3>
                <div className="basis-0 grow h-[14px] min-h-px min-w-px relative shrink-0" data-name="Primitive.label">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-nowrap tracking-[-0.1504px]">Modo Wireframe</p>
                  </div>
                </div>
                <div className="bg-[#030213] h-[18.391px] relative rounded-[3.35544e+07px] shrink-0 w-[32px]" data-name="Primitive.button">
                  <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[3.35544e+07px]" />
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pl-[15px] pr-px py-px relative size-full">
                    <div className="bg-white rounded-[3.35544e+07px] shrink-0 size-[16px]" data-name="Primitive.span" />
                  </div>
                </div>
                <Wrapper3 additionalClassNames="relative shrink-0">
                  <g clipPath="url(#clip0_109_1906)" id="Icon">
                    <path d={svgPaths.p3e496700} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p2c3f6760} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p1ac54b00} id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p35126200} id="Vector_4" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </g>
                  <defs>
                    <clipPath id="clip0_109_1906">
                      <rect fill="white" height="16" width="16" />
                    </clipPath>
                  </defs>
                </Wrapper3>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[24px] h-[973px] items-start relative shrink-0 w-full" data-name="Section">
            <div className="content-stretch flex gap-[16px] h-[32px] items-center relative shrink-0 w-full" data-name="Container">
              <TextText text="Jornada 1" additionalClassNames="w-[114.766px]" />
              <HeadingText text="Fluxo de Passageiro: Cadastro à Viagem" additionalClassNames="w-[547.297px]" />
            </div>
            <div className="content-stretch flex gap-[48px] h-[917px] items-start overflow-clip relative shrink-0 w-full" data-name="Container">
              <Wrapper5 additionalClassNames="h-[870px] w-[1024px]">
                <div className="absolute bg-white content-stretch flex flex-col gap-[4px] h-[86px] items-start left-0 pb-px pl-[20px] pr-[17px] pt-[17px] top-0 w-[1024px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[1px_1px_1px_4px] border-black border-solid inset-0 pointer-events-none" />
                  <HeadingText1 text="1. Cadastro Inicial" />
                  <ParagraphText text="Tela de login/cadastro centralizada." />
                </div>
                <Container3>
                  <Container1 />
                  <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[1016px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pl-[284px] pr-[348px] pt-[100px] relative rounded-[inherit] size-full">
                      <div className="bg-[#f9fafb] content-stretch flex flex-col gap-[24px] h-[520px] items-start relative shrink-0 w-full" data-name="RegisterScreen">
                        <div className="content-stretch flex flex-col gap-[8px] h-[128px] items-center relative shrink-0 w-full" data-name="Container">
                          <div className="basis-0 bg-[#eee] grow min-h-px min-w-px relative shrink-0 w-[60px]" data-name="Container">
                            <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[2px] pt-[14px] px-[14px] relative size-full">
                              <div className="h-[32px] overflow-clip relative shrink-0 w-full" data-name="Icon">
                                <div className="absolute inset-[29.17%_8.33%]" data-name="Vector">
                                  <div className="absolute inset-[-10%_-5%]">
                                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.3333 16">
                                      <path d={svgPaths.pb9bdf80} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                                    </svg>
                                  </div>
                                </div>
                                <Icon2Vector additionalClassNames="inset-[62.5%_62.5%_20.83%_20.83%]" />
                                <div className="absolute inset-[70.83%_37.5%_29.17%_37.5%]" data-name="Vector">
                                  <div className="absolute inset-[-1.33px_-16.67%]">
                                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6667 2.66667">
                                      <path d="M1.33333 1.33333H9.33333" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                                    </svg>
                                  </div>
                                </div>
                                <Icon2Vector additionalClassNames="inset-[62.5%_20.83%_20.83%_62.5%]" />
                              </div>
                            </div>
                          </div>
                          <Wrapper5 additionalClassNames="h-[32px] w-[331.266px]">
                            <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[32px] left-[166.5px] not-italic text-[#0a0a0a] text-[24px] text-center text-nowrap top-0 tracking-[-0.6px] translate-x-[-50%]">Bem-vindo ao VoucherPool</p>
                          </Wrapper5>
                          <Wrapper4 additionalClassNames="w-[302.453px]">
                            <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[20px] left-[151.5px] not-italic text-[#6a7282] text-[14px] text-center text-nowrap top-0 translate-x-[-50%]">Crie sua conta para começar a viajar</p>
                          </Wrapper4>
                        </div>
                        <div className="bg-white content-stretch flex flex-col gap-[24px] h-[368px] items-start p-[2px] relative shrink-0 w-full" data-name="Card">
                          <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
                          <CardHeader additionalClassNames="w-[380px]">
                            <CardTitleText text="Cadastro" />
                            <CardDescriptionText text="Preencha seus dados abaixo" />
                          </CardHeader>
                          <Wrapper7 additionalClassNames="w-[380px]">
                            <div className="absolute content-stretch flex flex-col gap-[16px] h-[206px] items-start left-0 px-[24px] py-0 top-0 w-[380px]" data-name="CardContent">
                              <div className="content-stretch flex flex-col gap-[8px] h-[58px] items-start relative shrink-0 w-full" data-name="RegisterScreen">
                                <PrimitiveLabelText text="Nome Completo" />
                                <InputText text="João Silva" />
                              </div>
                              <div className="content-stretch flex flex-col gap-[8px] h-[58px] items-start relative shrink-0 w-full" data-name="RegisterScreen">
                                <PrimitiveLabelText text="Email" />
                                <InputText text="joao@exemplo.com" />
                              </div>
                              <div className="content-stretch flex flex-col gap-[8px] h-[58px] items-start relative shrink-0 w-full" data-name="RegisterScreen">
                                <PrimitiveLabelText text="Telefone" />
                                <InputText text="(11) 99999-9999" />
                              </div>
                            </div>
                            <Text1 text="Criar Conta" additionalClassNames="left-[24px] top-[206px] w-[332px]" />
                          </Wrapper7>
                        </div>
                      </div>
                    </div>
                  </div>
                </Container3>
              </Wrapper5>
              <Arrow />
              <Wrapper5 additionalClassNames="h-[870px] w-[1024px]">
                <div className="absolute bg-white content-stretch flex flex-col gap-[4px] h-[86px] items-start left-0 pb-px pl-[20px] pr-[17px] pt-[17px] top-0 w-[1024px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[1px_1px_1px_4px] border-black border-solid inset-0 pointer-events-none" />
                  <HeadingText1 text="2. Carregamento de Saldo" />
                  <ParagraphText text="Painel da carteira com opções de recarga." />
                </div>
                <Container3>
                  <Container1 />
                  <Container5>
                    <Container2 />
                    <Container4>
                      <div className="h-[20px] relative shrink-0 w-[50.422px]" data-name="Text">
                        <Text3 text="Início" />
                      </div>
                      <div className="basis-0 grow h-[20px] min-h-px min-w-px opacity-70 relative shrink-0" data-name="Text">
                        <Text3 text="Carteira" />
                      </div>
                      <TextText2 text="Viagens" />
                    </Container4>
                    <Container />
                  </Container5>
                  <Container6>
                    <div className="content-stretch flex flex-col gap-[24px] h-[460px] items-start relative shrink-0 w-full" data-name="WalletScreen">
                      <div className="bg-[#eee] content-stretch flex flex-col h-[128px] items-start p-[2px] relative shrink-0 w-full" data-name="Card">
                        <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
                        <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[948px]" data-name="CardContent">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-center justify-center pb-0 pt-[8px] px-0 relative size-full">
                            <Wrapper4 additionalClassNames="opacity-80 w-[134.422px]">
                              <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[20px] left-0 not-italic text-[14px] text-black text-nowrap top-0">Saldo Disponível</p>
                            </Wrapper4>
                            <Wrapper5 additionalClassNames="h-[40px] w-[151.234px]">
                              <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[40px] left-0 not-italic text-[36px] text-black top-[-1px] w-[152px]">R$ 0.00</p>
                            </Wrapper5>
                          </div>
                        </div>
                      </div>
                      <div className="content-stretch flex flex-col gap-[16px] h-[308px] items-start relative shrink-0 w-full" data-name="Container">
                        <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 2">
                          <Icon3 additionalClassNames="top-[4px]">
                            <path d={svgPaths.p3e8f800} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                            <path d={svgPaths.p11d57a00} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                          </Icon3>
                          <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[28px] left-[28px] not-italic text-[#0a0a0a] text-[18px] text-nowrap top-0">Carregar Saldo</p>
                        </div>
                        <div className="content-stretch flex flex-col gap-[24px] h-[264px] items-start relative shrink-0 w-full" data-name="Primitive.div">
                          <Wrapper5 additionalClassNames="bg-[#ececf0] h-[36px] w-[952px]">
                            <Text text="Banco" additionalClassNames="left-[3px] w-[315.328px]" />
                            <Text text="Móvel" additionalClassNames="left-[318.33px] w-[315.328px]" />
                            <Text text="Espécie" additionalClassNames="left-[633.66px] w-[315.344px]" />
                          </Wrapper5>
                          <div className="basis-0 bg-white grow min-h-px min-w-px relative shrink-0 w-[952px]" data-name="WalletScreen">
                            <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start pb-px pt-[17px] px-[17px] relative size-full">
                              <div className="content-stretch flex flex-col h-[50px] items-start relative shrink-0 w-full" data-name="Container">
                                <PrimitiveLabelText text="Valor da Recarga (R$)" />
                                <InputText text="0.00" />
                              </div>
                              <div className="content-stretch flex flex-col gap-[16px] h-[104px] items-start relative shrink-0 w-full" data-name="Primitive.div">
                                <div className="bg-[#f9fafb] h-[52px] relative shrink-0 w-full" data-name="WalletScreen">
                                  <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[20px] left-[16px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[16px]">Transfira para a chave PIX:</p>
                                  <div className="absolute content-stretch flex h-[16px] items-start left-[251.25px] top-[18px] w-[134.422px]" data-name="Bold Text">
                                    <p className="font-['Courier_New:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#4a5565] text-[14px] text-nowrap">voucher@pool.com</p>
                                  </div>
                                  <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[20px] left-[385.67px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[16px]">e aguarde a confirmação.</p>
                                </div>
                                <div className="bg-[#eee] h-[36px] relative shrink-0 w-full" data-name="Button">
                                  <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
                                  <Wrapper additionalClassNames="absolute left-[346.38px] top-[10px]">
                                    <mask fill="white" id="path-1-inside-1_109_1868">
                                      <path d="M0 0H16V16H0V0Z" />
                                    </mask>
                                    <path d="M0 0H16V16H0V0Z" fill="var(--fill-0, white)" />
                                    <path d={svgPaths.p11fda300} fill="var(--stroke-0, black)" mask="url(#path-1-inside-1_109_1868)" />
                                    <path d={svgPaths.p35993080} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                    <path d="M1.33333 6.66667H14.6667" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                  </Wrapper>
                                  <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[20px] left-[475.38px] not-italic text-[14px] text-black text-center text-nowrap top-[8px] translate-x-[-50%] uppercase">Confirmar Transferência</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Container6>
                </Container3>
              </Wrapper5>
              <Arrow />
              <Wrapper5 additionalClassNames="h-[870px] w-[1024px]">
                <div className="absolute bg-white content-stretch flex flex-col gap-[4px] h-[86px] items-start left-0 pb-px pl-[20px] pr-[17px] pt-[17px] top-0 w-[1024px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[1px_1px_1px_4px] border-black border-solid inset-0 pointer-events-none" />
                  <HeadingText1 text="3. Pesquisa de Viagem" />
                  <ParagraphText text="Interface de busca expandida." />
                </div>
                <Container3>
                  <Container1 />
                  <Container5>
                    <Container2 />
                    <Container4>
                      <div className="h-[20px] relative shrink-0 w-[50.422px]" data-name="Text">
                        <Text3 text="Início" />
                      </div>
                      <div className="basis-0 grow h-[20px] min-h-px min-w-px opacity-70 relative shrink-0" data-name="Text">
                        <Text3 text="Carteira" />
                      </div>
                      <TextText2 text="Viagens" />
                    </Container4>
                    <Container />
                  </Container5>
                  <Container6>
                    <div className="content-stretch flex flex-col gap-[24px] h-[338px] items-start relative shrink-0 w-full" data-name="SearchScreen">
                      <div className="bg-white h-[220px] relative shrink-0 w-full" data-name="Container">
                        <div className="content-stretch flex flex-col gap-[16px] items-start pb-0 pt-[16px] px-[16px] relative size-full">
                          <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 2">
                            <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[28px] left-0 not-italic text-[#0a0a0a] text-[18px] text-nowrap top-0">Para onde vamos?</p>
                          </div>
                          <div className="h-[84px] relative shrink-0 w-full" data-name="Container">
                            <div className="absolute content-stretch flex flex-col gap-[12px] h-[84px] items-start left-[24px] top-0 w-[896px]" data-name="Container">
                              <InputText text="De onde sair?" />
                              <InputText text="Para onde ir?" />
                            </div>
                            <div className="absolute bg-[#e5e7eb] content-stretch flex flex-col gap-[32px] h-[52px] items-start left-[12px] px-[-4px] py-0 top-[12px] w-[2px]" data-name="Container">
                              <div className="bg-[#eee] h-[10px] relative shrink-0 w-full" data-name="Container">
                                <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
                              </div>
                              <div className="bg-black h-[10px] shrink-0 w-full" data-name="Container" />
                            </div>
                          </div>
                          <div className="bg-[#eee] h-[36px] relative shrink-0 w-full" data-name="Button">
                            <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
                            <Wrapper additionalClassNames="absolute left-[385.19px] top-[10px]">
                              <path d="M13.9999 14L11.1066 11.1066" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                              <path d={svgPaths.p107a080} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                            </Wrapper>
                            <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[20px] left-[476.19px] not-italic text-[14px] text-black text-center text-nowrap top-[8px] translate-x-[-50%] uppercase">Buscar Viagens</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white h-[94px] relative shrink-0 w-full" data-name="Container">
                        <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none" />
                        <div className="content-stretch flex flex-col gap-[8px] items-start pb-px pt-[17px] px-[17px] relative size-full">
                          <div className="h-[16px] relative shrink-0 w-full" data-name="Primitive.label">
                            <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-0 tracking-[0.6px] uppercase">Pagamento Offline / Terceiros</p>
                          </div>
                          <div className="content-stretch flex gap-[8px] h-[36px] items-start relative shrink-0 w-full" data-name="Container">
                            <Wrapper2 text="ID da Conta (Opcional)" />
                            <ButtonText text="Verificar" additionalClassNames="w-[111.625px]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Container6>
                </Container3>
              </Wrapper5>
              <Arrow />
              <Wrapper5 additionalClassNames="h-[870px] w-[1024px]">
                <div className="absolute bg-white content-stretch flex flex-col gap-[4px] h-[86px] items-start left-0 pb-px pl-[20px] pr-[17px] pt-[17px] top-0 w-[1024px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[1px_1px_1px_4px] border-black border-solid inset-0 pointer-events-none" />
                  <HeadingText1 text="4. Confirmação de Pagamento" />
                  <ParagraphText text="Checkout com revisão de detalhes." />
                </div>
                <Container3>
                  <Container1 />
                  <Container5>
                    <Container2 />
                    <Container4>
                      <div className="h-[20px] relative shrink-0 w-[50.422px]" data-name="Text">
                        <Text3 text="Início" />
                      </div>
                      <div className="basis-0 grow h-[20px] min-h-px min-w-px opacity-70 relative shrink-0" data-name="Text">
                        <Text3 text="Carteira" />
                      </div>
                      <TextText2 text="Viagens" />
                    </Container4>
                    <Container />
                  </Container5>
                  <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[1016px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pl-[164.5px] pr-[179.5px] pt-[32px] relative rounded-[inherit] size-full">
                      <div className="bg-white h-[668px] relative shrink-0 w-full" data-name="Card">
                        <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip p-[2px] relative rounded-[inherit] size-full">
                          <div className="bg-[rgba(3,2,19,0.1)] h-[112px] relative shrink-0 w-[668px]" data-name="PaymentScreen">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-center justify-center relative size-full">
                              <Wrapper4 additionalClassNames="w-[131.281px]">
                                <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[20px] left-[66px] not-italic text-[14px] text-black text-center text-nowrap top-0 tracking-[0.35px] translate-x-[-50%] uppercase">Valor da Viagem</p>
                              </Wrapper4>
                              <Wrapper5 additionalClassNames="h-[40px] w-[172.844px]">
                                <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[40px] left-[86.5px] not-italic text-[36px] text-black text-center top-[-1px] translate-x-[-50%] w-[173px]">R$ 45.00</p>
                              </Wrapper5>
                            </div>
                          </div>
                          <div className="bg-white h-[62px] relative shrink-0 w-[668px]" data-name="CardHeader">
                            <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid gap-[6px] grid grid-cols-[repeat(1,_minmax(0px,_1fr))] grid-rows-[minmax(0px,_28fr)_minmax(0px,_1fr)] pb-[8px] pt-[26px] px-[26px] relative size-full">
                              <div className="[grid-area:1_/_1] place-self-stretch relative shrink-0" data-name="CardTitle">
                                <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[28px] left-0 not-italic text-[#0a0a0a] text-[18px] text-nowrap top-0">Detalhes da Viagem</p>
                              </div>
                            </div>
                          </div>
                          <CardContent>
                            <div className="h-[44px] relative shrink-0 w-full" data-name="PaymentScreen">
                              <div className="absolute left-0 size-[20px] top-[2px]" data-name="Icon">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                                  <g clipPath="url(#clip0_109_1895)" id="Icon">
                                    <path d="M10 5V10L13.3333 11.6667" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                                    <path d={svgPaths.p14d24500} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_109_1895">
                                      <rect fill="white" height="20" width="20" />
                                    </clipPath>
                                  </defs>
                                </svg>
                              </div>
                              <div className="absolute content-stretch flex flex-col h-[44px] items-start left-[32px] top-0 w-[48.016px]" data-name="Container">
                                <div className="h-[24px] relative shrink-0 w-full" data-name="Container">
                                  <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#0a0a0a] text-[16px] text-nowrap top-0">14:30</p>
                                </div>
                                <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
                                  <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-0">Hoje</p>
                                </div>
                              </div>
                            </div>
                            <div className="h-[44px] relative shrink-0 w-full" data-name="PaymentScreen">
                              <Icon3 additionalClassNames="top-[2px]">
                                <path d={svgPaths.p26ddc800} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                                <path d={svgPaths.p35ba4680} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                              </Icon3>
                              <div className="absolute content-stretch flex flex-col gap-[4px] h-[44px] items-start left-[32px] top-0 w-[117.641px]" data-name="Container">
                                <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
                                  <TextText3 text="De:" additionalClassNames="w-[25.219px]" />
                                  <TextText4 text="São Paulo" additionalClassNames="left-[33.63px] w-[75.625px]" />
                                </div>
                                <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
                                  <TextText3 text="Para:" additionalClassNames="w-[42.016px]" />
                                  <TextText4 text="Campinas" additionalClassNames="left-[50.42px] w-[67.219px]" />
                                </div>
                              </div>
                            </div>
                            <div className="h-[49px] relative shrink-0 w-full" data-name="PaymentScreen">
                              <Icon3 additionalClassNames="top-[2px]">
                                <path d={svgPaths.p1beb9580} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                                <path d={svgPaths.p32ab0300} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                              </Icon3>
                              <div className="absolute h-[49px] left-[32px] top-0 w-[86.422px]" data-name="Container">
                                <div className="absolute h-[24px] left-0 top-0 w-[86.422px]" data-name="Container">
                                  <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#0a0a0a] text-[16px] text-nowrap top-0">Carlos A.</p>
                                </div>
                                <div className="absolute bg-[#fef9c2] h-[20px] left-0 top-[28px] w-[55.813px]" data-name="Container">
                                  <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[16px] left-[6px] not-italic text-[#894b00] text-[12px] top-[2px] w-[44px]">⭐ 4.8</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-[rgba(0,0,0,0.1)] h-px shrink-0 w-full" data-name="Primitive.div" />
                            <div className="content-stretch flex h-[40px] items-center justify-between relative shrink-0 w-full" data-name="PaymentScreen">
                              <Wrapper6 additionalClassNames="w-[144.031px]">
                                <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] text-nowrap top-0">Seu Saldo Atual</p>
                              </Wrapper6>
                              <Wrapper6 additionalClassNames="w-[86.422px]">
                                <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[24px] left-0 not-italic text-[#0a0a0a] text-[16px] top-0 w-[87px]">R$ 100.00</p>
                              </Wrapper6>
                            </div>
                            <div className="bg-[#eff6ff] h-[40px] relative shrink-0 w-full" data-name="PaymentScreen">
                              <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#155dfc] text-[12px] text-nowrap top-[12px]">Pagamento vinculado ao ID Offline:</p>
                              <div className="absolute content-stretch flex h-[14px] items-start left-[264.05px] top-[13px] w-[50.422px]" data-name="Bold Text">
                                <p className="font-['Courier_New:Bold',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#155dfc] text-[12px] text-nowrap">OFF-123</p>
                              </div>
                            </div>
                          </CardContent>
                          <div className="h-[120px] relative shrink-0 w-[668px]" data-name="CardFooter">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-center pb-[24px] pt-0 px-0 relative size-full">
                              <div className="bg-[#eee] h-[48px] relative shrink-0 w-[620px]" data-name="Button">
                                <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[18px] py-[10px] relative size-full">
                                  <p className="font-['Courier_New:Bold',sans-serif] leading-[28px] not-italic relative shrink-0 text-[18px] text-black text-center text-nowrap uppercase">Confirmar Pagamento</p>
                                </div>
                              </div>
                              <ButtonText text="Cancelar" additionalClassNames="w-[620px]" />
                            </div>
                          </div>
                        </div>
                        <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </Container3>
              </Wrapper5>
              <Arrow />
              <Wrapper5 additionalClassNames="h-[870px] w-[1024px]">
                <div className="absolute bg-white content-stretch flex flex-col gap-[4px] h-[86px] items-start left-0 pb-px pl-[20px] pr-[17px] pt-[17px] top-0 w-[1024px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[1px_1px_1px_4px] border-black border-solid inset-0 pointer-events-none" />
                  <HeadingText1 text="5. Voucher Gerado" />
                  <ParagraphText text="Voucher de sucesso." />
                </div>
                <Container3>
                  <Container1 />
                  <Container5>
                    <Container2 />
                    <Container4>
                      <div className="h-[20px] relative shrink-0 w-[50.422px]" data-name="Text">
                        <Text3 text="Início" />
                      </div>
                      <div className="basis-0 grow h-[20px] min-h-px min-w-px opacity-70 relative shrink-0" data-name="Text">
                        <Text3 text="Carteira" />
                      </div>
                      <TextText2 text="Viagens" />
                    </Container4>
                    <Container />
                  </Container5>
                  <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[1016px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pl-[212.5px] pr-[227.5px] pt-[72px] relative rounded-[inherit] size-full">
                      <div className="h-[586px] relative shrink-0 w-full" data-name="ConfirmationScreen">
                        <div className="absolute content-stretch flex flex-col gap-[8px] h-[64px] items-start left-[119.97px] top-[128px] w-[336.063px]" data-name="Container">
                          <div className="h-[32px] relative shrink-0 w-full" data-name="Heading 2">
                            <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[32px] left-[168.41px] not-italic text-[#101828] text-[24px] text-center text-nowrap top-0 translate-x-[-50%]">Viagem Confirmada!</p>
                          </div>
                          <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
                            <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[24px] left-[168.5px] not-italic text-[#6a7282] text-[16px] text-center text-nowrap top-0 translate-x-[-50%]">Seu voucher foi gerado com sucesso.</p>
                          </div>
                        </div>
                        <div className="absolute bg-white content-stretch flex flex-col h-[294px] items-start left-0 p-[2px] top-[224px] w-[576px]" data-name="Card">
                          <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
                          <Wrapper7 additionalClassNames="w-[572px]">
                            <div className="absolute content-stretch flex h-[24px] items-center justify-between left-[24px] top-[24px] w-[524px]" data-name="ConfirmationScreen">
                              <Wrapper4 additionalClassNames="w-[50.422px]">
                                <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[20px] left-[25.5px] not-italic text-[#6a7282] text-[14px] text-center text-nowrap top-0 translate-x-[-50%]">Origem</p>
                              </Wrapper4>
                              <Wrapper6 additionalClassNames="w-[86.422px]">
                                <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[24px] left-[43.5px] not-italic text-[#0a0a0a] text-[16px] text-center text-nowrap top-0 translate-x-[-50%]">São Paulo</p>
                              </Wrapper6>
                            </div>
                            <div className="absolute content-stretch flex h-[24px] items-center justify-between left-[24px] top-[64px] w-[524px]" data-name="ConfirmationScreen">
                              <TextText5 text="Destino" />
                              <Wrapper6 additionalClassNames="w-[76.813px]">
                                <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[24px] left-[38.5px] not-italic text-[#0a0a0a] text-[16px] text-center text-nowrap top-0 translate-x-[-50%]">Campinas</p>
                              </Wrapper6>
                            </div>
                            <div className="absolute content-stretch flex h-[24px] items-center justify-between left-[24px] top-[104px] w-[524px]" data-name="ConfirmationScreen">
                              <TextText5 text="Horário" />
                              <Wrapper6 additionalClassNames="w-[48.016px]">
                                <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[24px] left-[24.5px] not-italic text-[#0a0a0a] text-[16px] text-center text-nowrap top-0 translate-x-[-50%]">14:30</p>
                              </Wrapper6>
                            </div>
                            <div className="absolute bg-white border border-[rgba(0,0,0,0.1)] border-solid h-[74px] left-[261px] top-[160px] w-[50px]" data-name="ConfirmationScreen">
                              <div className="absolute left-[8px] size-[32px] top-[8px]" data-name="Icon">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
                                  <g id="Icon">
                                    <path d={svgPaths.p4f17080} id="Vector" stroke="var(--stroke-0, #1E2939)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                                    <path d="M17.3333 6.66667V9.33333" id="Vector_2" stroke="var(--stroke-0, #1E2939)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                                    <path d="M17.3333 22.6667V25.3333" id="Vector_3" stroke="var(--stroke-0, #1E2939)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                                    <path d="M17.3333 14.6667V17.3333" id="Vector_4" stroke="var(--stroke-0, #1E2939)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                                  </g>
                                </svg>
                              </div>
                              <div className="absolute bg-black h-[4px] left-[8px] top-[44px] w-[32px]" data-name="Container" />
                              <div className="absolute bg-black h-[4px] left-[8px] top-[52px] w-[21.328px]" data-name="Container" />
                              <div className="absolute bg-black h-[4px] left-[8px] top-[60px] w-[32px]" data-name="Container" />
                            </div>
                            <div className="absolute h-[16px] left-[24px] top-[250px] w-[524px]" data-name="ConfirmationScreen">
                              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[262.13px] not-italic text-[#99a1af] text-[12px] text-center top-px translate-x-[-50%] w-[87px]">ID: 1-545338</p>
                            </div>
                          </Wrapper7>
                        </div>
                        <Text1 text="Voltar ao Início" additionalClassNames="left-0 top-[550px] w-[576px]" />
                        <div className="absolute left-[240px] size-[96px] top-0" data-name="Container">
                          <div className="absolute bg-[#b9f8cf] blur-xl filter left-0 opacity-50 size-[96px] top-0" data-name="ConfirmationScreen" />
                          <div className="absolute left-0 size-[96px] top-0" data-name="Icon">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 96 96">
                              <g id="Icon">
                                <path d={svgPaths.p91acb00} id="Vector" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" />
                                <path d="M36 48L44 56L60 40" id="Vector_2" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" />
                              </g>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Container3>
              </Wrapper5>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[24px] h-[958px] items-start relative shrink-0 w-full" data-name="Section">
            <div className="content-stretch flex gap-[16px] h-[32px] items-center relative shrink-0 w-full" data-name="Container">
              <TextText text="Telas de Suporte" additionalClassNames="w-[176.031px]" />
              <HeadingText text="Gestão e Agente" additionalClassNames="w-[216.047px]" />
            </div>
            <div className="content-stretch flex gap-[48px] h-[902px] items-start relative shrink-0 w-full" data-name="Container">
              <Wrapper5 additionalClassNames="h-[870px] w-[1024px]">
                <div className="absolute bg-white content-stretch flex flex-col gap-[4px] h-[86px] items-start left-0 pb-px pl-[20px] pr-[17px] pt-[17px] top-0 w-[1024px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[1px_1px_1px_4px] border-black border-solid inset-0 pointer-events-none" />
                  <HeadingText1 text="Histórico de Viagens" />
                  <ParagraphText text="Grade de viagens realizadas." />
                </div>
                <Container3>
                  <Container1 />
                  <Container5>
                    <Container2 />
                    <Container4>
                      <div className="h-[20px] relative shrink-0 w-[50.422px]" data-name="Text">
                        <Text3 text="Início" />
                      </div>
                      <div className="basis-0 grow h-[20px] min-h-px min-w-px opacity-70 relative shrink-0" data-name="Text">
                        <Text3 text="Carteira" />
                      </div>
                      <TextText2 text="Viagens" />
                    </Container4>
                    <Container />
                  </Container5>
                  <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[1016px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pl-[32px] pr-[47px] pt-[32px] relative rounded-[inherit] size-full">
                      <div className="content-stretch flex flex-col gap-[24px] h-[729px] items-start relative shrink-0 w-full" data-name="HistoryScreen">
                        <div className="h-[32px] relative shrink-0 w-full" data-name="Heading 2">
                          <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[32px] left-[4px] not-italic text-[#0a0a0a] text-[24px] text-nowrap top-0 tracking-[-0.6px]">Minhas Viagens</p>
                        </div>
                        <div className="h-[673px] relative shrink-0 w-full" data-name="Container">
                          <Card additionalClassNames="top-0">
                            <div className="bg-[#00c950] h-[6px] shrink-0 w-[933px]" data-name="HistoryScreen" />
                            <CardContent1>
                              <div className="content-stretch flex h-[44px] items-start justify-between relative shrink-0 w-full" data-name="HistoryScreen">
                                <Container7 additionalClassNames="w-[88.016px]">
                                  <TextText1 text="Campinas" additionalClassNames="w-[88.016px]" />
                                  <TextText6 text="05/01/2024" additionalClassNames="w-[88.016px]" />
                                </Container7>
                                <BadgeText text="Concluída" />
                              </div>
                              <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="HistoryScreen">
                                <Icon />
                                <Wrapper4 additionalClassNames="w-[109.234px]">
                                  <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] top-0 w-[110px]">De: São Paulo</p>
                                </Wrapper4>
                              </div>
                              <div className="content-stretch flex h-[33px] items-center justify-between pb-0 pt-px px-0 relative shrink-0 w-full" data-name="HistoryScreen">
                                <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
                                <TextText7 text="R$ 45.00" />
                                <Container8>
                                  {[...Array(4).keys()].map((_, i) => (
                                    <Icon1 />
                                  ))}
                                  <Icon2>
                                    <path d={svgPaths.p1416a00} fill="var(--fill-0, #FDC700)" id="Vector" stroke="var(--stroke-0, #FDC700)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                  </Icon2>
                                </Container8>
                              </div>
                            </CardContent1>
                          </Card>
                          <Card additionalClassNames="top-[211px]">
                            <div className="bg-[#00c950] h-[6px] shrink-0 w-[933px]" data-name="HistoryScreen" />
                            <CardContent1>
                              <div className="content-stretch flex h-[44px] items-start justify-between relative shrink-0 w-full" data-name="HistoryScreen">
                                <Container7 additionalClassNames="w-[97.219px]">
                                  <TextText1 text="São Paulo" additionalClassNames="w-[97.219px]" />
                                  <TextText6 text="02/01/2024" additionalClassNames="w-[97.219px]" />
                                </Container7>
                                <BadgeText text="Concluída" />
                              </div>
                              <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="HistoryScreen">
                                <Icon />
                                <Wrapper4 additionalClassNames="w-[84.031px]">
                                  <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] top-0 w-[85px]">De: Santos</p>
                                </Wrapper4>
                              </div>
                              <div className="content-stretch flex h-[33px] items-center justify-between pb-0 pt-px px-0 relative shrink-0 w-full" data-name="HistoryScreen">
                                <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
                                <TextText7 text="R$ 30.00" />
                                <Container8>
                                  {[...Array(4).keys()].map((_, i) => (
                                    <Icon1 />
                                  ))}
                                  <Icon2>
                                    <path d={svgPaths.p1416a00} id="Vector" stroke="var(--stroke-0, #E5E7EB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                  </Icon2>
                                </Container8>
                              </div>
                            </CardContent1>
                          </Card>
                          <Card additionalClassNames="top-[422px]">
                            <div className="bg-[#ff6467] h-[6px] shrink-0 w-[933px]" data-name="HistoryScreen" />
                            <CardContent1>
                              <div className="content-stretch flex h-[44px] items-start justify-between relative shrink-0 w-full" data-name="HistoryScreen">
                                <Container7 additionalClassNames="w-[97.219px]">
                                  <TextText1 text="São Paulo" additionalClassNames="w-[97.219px]" />
                                  <TextText6 text="28/12/2023" additionalClassNames="w-[97.219px]" />
                                </Container7>
                                <Wrapper9 additionalClassNames="bg-[#d4183d]">
                                  <p className="font-['Courier_New:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-white">Cancelada</p>
                                </Wrapper9>
                              </div>
                              <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="HistoryScreen">
                                <Icon />
                                <Wrapper4 additionalClassNames="w-[100.828px]">
                                  <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] top-0 w-[101px]">De: Campinas</p>
                                </Wrapper4>
                              </div>
                              <div className="h-[33px] relative shrink-0 w-full" data-name="HistoryScreen">
                                <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
                                <div className="flex flex-row items-center size-full">
                                  <div className="content-stretch flex items-center justify-between pb-0 pl-0 pr-[833.547px] pt-px relative size-full">
                                    <TextText7 text="R$ 42.00" />
                                  </div>
                                </div>
                              </div>
                            </CardContent1>
                          </Card>
                          <div className="absolute content-stretch flex h-[14px] items-start left-[401.28px] top-[655px] w-[134.422px]" data-name="Text">
                            <p className="font-['Courier_New:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#99a1af] text-[12px] text-center text-nowrap tracking-[1.2px] uppercase">Fim do histórico</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Container3>
              </Wrapper5>
              <Wrapper5 additionalClassNames="h-[870px] w-[1024px]">
                <div className="absolute bg-white content-stretch flex flex-col gap-[4px] h-[86px] items-start left-0 pb-px pl-[20px] pr-[17px] pt-[17px] top-0 w-[1024px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[1px_1px_1px_4px] border-black border-solid inset-0 pointer-events-none" />
                  <HeadingText1 text="Visão do Agente Autorizado" />
                  <ParagraphText text="Interface administrativa para agentes." />
                </div>
                <Container3>
                  <Container1 />
                  <Container5>
                    <Container2 />
                    <Container4>
                      <div className="h-[20px] relative shrink-0 w-[50.422px]" data-name="Text">
                        <Text3 text="Início" />
                      </div>
                      <div className="basis-0 grow h-[20px] min-h-px min-w-px opacity-70 relative shrink-0" data-name="Text">
                        <Text3 text="Carteira" />
                      </div>
                      <TextText2 text="Viagens" />
                    </Container4>
                    <Container />
                  </Container5>
                  <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[1016px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pt-[32px] px-[172px] relative rounded-[inherit] size-full">
                      <div className="content-stretch flex flex-col gap-[24px] h-[476px] items-start relative shrink-0 w-full" data-name="AgentScreen">
                        <div className="content-stretch flex h-[28px] items-center justify-between relative shrink-0 w-full" data-name="Container">
                          <Wrapper5 additionalClassNames="h-[28px] w-[192.031px]">
                            <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[28px] left-0 not-italic text-[#0a0a0a] text-[20px] text-nowrap top-0">Painel do Agente</p>
                          </Wrapper5>
                          <div className="bg-[#f0fdf4] h-[22px] relative shrink-0 w-[110.016px]" data-name="Badge">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
                              <Wrapper10 additionalClassNames="left-[9px] top-[5px]">
                                <g id="Icon">
                                  <path d="M8 5.5L9 6.5L11 4.5" id="Vector" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d={svgPaths.p38fdee00} id="Vector_2" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d={svgPaths.p13058e80} id="Vector_3" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                              </Wrapper10>
                              <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[16px] left-[29px] not-italic text-[#00a63e] text-[12px] text-nowrap top-[3px]">Autorizado</p>
                            </div>
                            <div aria-hidden="true" className="absolute border border-[#00a63e] border-solid inset-0 pointer-events-none" />
                          </div>
                        </div>
                        <div className="bg-white content-stretch flex flex-col gap-[24px] h-[326px] items-start p-[2px] relative shrink-0 w-full" data-name="Card">
                          <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
                          <CardHeader additionalClassNames="w-[668px]">
                            <CardTitleText text="Recarga de Saldo" />
                            <CardDescriptionText text="Insira o ID do usuário e o valor pago em espécie." />
                          </CardHeader>
                          <CardContent>
                            <div className="content-stretch flex flex-col gap-[8px] h-[58px] items-start relative shrink-0 w-full" data-name="AgentScreen">
                              <PrimitiveLabelText text="ID do Usuário / Código QR" />
                              <div className="content-stretch flex gap-[8px] h-[36px] items-start relative shrink-0 w-full" data-name="Container">
                                <Wrapper2 text="Ex: USER-123" />
                                <div className="bg-white relative shrink-0 size-[36px]" data-name="Button">
                                  <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
                                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[2px] relative size-full">
                                    <Wrapper additionalClassNames="relative shrink-0">
                                      <path d={svgPaths.p10a90f00} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                      <path d={svgPaths.p56e5b00} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                      <path d={svgPaths.p16b80040} id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                      <path d={svgPaths.p613b980} id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                      <path d="M14 14V14.0067" id="Vector_5" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                      <path d={svgPaths.pa2dba80} id="Vector_6" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                      <path d="M2 8H2.00667" id="Vector_7" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                      <path d="M8 2H8.00667" id="Vector_8" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                      <path d="M8 10.6667V10.6733" id="Vector_9" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                      <path d="M10.6667 8H11.3333" id="Vector_10" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                      <path d="M14 8V8.00667" id="Vector_11" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                      <path d="M8 14V13.3333" id="Vector_12" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                    </Wrapper>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="content-stretch flex flex-col gap-[8px] h-[58px] items-start relative shrink-0 w-full" data-name="AgentScreen">
                              <PrimitiveLabelText text="Valor (R$)" />
                              <Wrapper1>
                                <p className="font-['Courier_New:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap">0.00</p>
                              </Wrapper1>
                            </div>
                            <div className="bg-white h-[36px] relative shrink-0 w-full" data-name="Button">
                              <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none" />
                              <Wrapper additionalClassNames="absolute left-[222.58px] top-[10px]">
                                <path d={svgPaths.p26ef3000} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                <path d={svgPaths.p18635ff0} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                <path d="M4 8H4.00667M12 8H12.0067" id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                              </Wrapper>
                              <p className="absolute font-['Courier_New:Bold',sans-serif] leading-[20px] left-[326.08px] not-italic text-[14px] text-black text-center text-nowrap top-[8px] translate-x-[-50%] uppercase">Confirmar Recarga</p>
                            </div>
                          </CardContent>
                        </div>
                        <div className="bg-[#fefce8] h-[74px] relative shrink-0 w-full" data-name="Container">
                          <div aria-hidden="true" className="absolute border border-[#fff085] border-solid inset-0 pointer-events-none" />
                          <div className="absolute content-stretch flex h-[16px] items-start left-[17px] top-[19px] w-[67.219px]" data-name="Bold Text">
                            <p className="font-['Courier_New:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#894b00] text-[14px] text-nowrap">Atenção:</p>
                          </div>
                          <p className="absolute font-['Courier_New:Regular',sans-serif] leading-[20px] left-[17px] not-italic text-[#894b00] text-[14px] top-[17px] w-[605px]">Verifique a identidade do usuário antes de confirmar pagamentos acima de R$ 100,00.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Container3>
              </Wrapper5>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#030213] h-[40px] left-[1337.23px] rounded-[3.35544e+07px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] top-[907px] w-[182.766px]" data-name="Button">
        <Wrapper additionalClassNames="absolute left-[16px] top-[12px]">
          <path d={svgPaths.p15efa800} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 12H8.00667" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </Wrapper>
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[107.5px] not-italic text-[14px] text-center text-nowrap text-white top-[10px] tracking-[-0.1504px] translate-x-[-50%]">Ver App Interativo</p>
      </div>
    </div>
  );
}